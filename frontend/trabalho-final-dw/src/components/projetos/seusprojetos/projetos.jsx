import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { ROTAS } from '../../../utils/rotas.js';
import api from '../../../services/api';
import { excluirProjeto, restaurarProjeto } from '../../../services/projetoService';
import { gerarPdfPorId } from '../../../services/gerarProjetoPdf.js';
import DialogoDadosProjeto from '../detalhes/DialogoDadosProjeto';
import FeedbackIndisponivel from '../../comum/FeedbackIndisponivel';
import ModalAlerta from '../../comum/ModalAlerta';
import ToastSucesso from '../../comum/ToastSucesso';
import { usePeriodo } from '../../../hooks/usePeriodo';
import BarraDeBusca from './projetosComponentes/BarraDeBusca';
import FiltrosDeOrdenacao from './projetosComponentes/FiltrosDeOrdenacao';
import ProjetoCard from './projetosComponentes/ProjetoCard';
import Paginacao from './projetosComponentes/Paginacao';

function Projetos() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const setAdmin = useAuthStore((state) => state.setAdmin);
    const setPerfil = useAuthStore((state) => state.setPerfil);

    const [projetos, setProjetos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [excluindoId, setExcluindoId] = useState(null);
    const [baixandoId, setBaixandoId] = useState(null);
    const [confirmacaoPendente, setConfirmacaoPendente] = useState(null);
    const [toast, setToast] = useState(null);
    // id do projeto aberto no diálogo de dados; null = diálogo fechado
    const [vendoId, setVendoId] = useState(null);
    const navigate = useNavigate();
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalProjetos, setTotalProjetos] = useState(0);
    const [buscaAplicada, setBuscaAplicada] = useState('');

    const [tipoBusca, setTipoBusca] = useState('nome');
    const [ordemAlfabetica, setOrdemAlfabetica] = useState('asc');
    const [ordemCronologica, setOrdemCronologica] = useState('recentes');
    // Aba da lixeira (só admin): false = ativos, true = excluídos.
    const [mostrandoExcluidos, setMostrandoExcluidos] = useState(false);
    // Período de extensão: fora dele, comum não cria nem edita (admin bypassa).
    const { dados: periodo, aberto: periodoAberto, loading: periodoLoading } = usePeriodo();
    const [mostrarFeedbackPeriodo, setMostrarFeedbackPeriodo] = useState(false);
    const periodoFechadoParaComum = !isAdmin && !periodoLoading && !periodoAberto;
    // Ignora respostas antigas quando o usuário troca rápido de aba/página.
    const buscaIdRef = useRef(0);

    function redirecionaProCadastro() {
        navigate(ROTAS.NOVO_PROJETO);
    }

    // Baixa direto o PDF
    async function handleBaixar(id) {
        setBaixandoId(id);
        setErro(null);
        try {
            await gerarPdfPorId(id);
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sua sessão expirou. Faça login novamente para baixar.');
            } else if (err.response?.status === 404) {
                setErro('Projeto não encontrado ou você não tem acesso a ele.');
            } else {
                setErro('Não foi possível baixar o PDF. Tente novamente.');
            }
        } finally {
            setBaixandoId(null);
        }
    }

    function redirecionaParaImpressao(id) {
        navigate(ROTAS.imprimirProjeto(id));
    }

    function redirecionaParaEdicao(id){
        navigate(ROTAS.editarProjeto(id));
    }

    async function handleExcluir(projeto) {
        setExcluindoId(projeto.id);
        setErro(null);
        try {
            await excluirProjeto(projeto.id);
            setProjetos((atuais) => atuais.filter((p) => p.id !== projeto.id));
            return true;
        } catch (err) {
            setErro(err.response?.data?.detail ?? 'Erro ao excluir projeto.');
            return false;
        } finally {
            setExcluindoId(null);
        }
    }

    async function handleRestaurar(projeto) {
        setExcluindoId(projeto.id);
        setErro(null);
        try {
            await restaurarProjeto(projeto.id);
            setProjetos((atuais) => atuais.filter((p) => p.id !== projeto.id));
            return true;
        } catch (err) {
            setErro(err.response?.data?.detail ?? 'Erro ao restaurar projeto.');
            return false;
        } finally {
            setExcluindoId(null);
        }
    }

    async function confirmarPendente() {
        const pendente = confirmacaoPendente;
        if (!pendente || excluindoId !== null) return;
        const sucesso = pendente.tipo === 'excluir'
            ? await handleExcluir(pendente.projeto)
            : await handleRestaurar(pendente.projeto);
        setConfirmacaoPendente(null);
        if (sucesso) {
            setToast(pendente.tipo === 'excluir' ? 'Projeto excluído.' : 'Projeto restaurado.');
        }
    }

    useEffect(() => {
        // Sem token não tem nem por que chamar a API.
        if (!isAutenticado) {
            return;
        }

        // Garante a flag de admin mesmo para sessoes antigas (logadas antes
        // de a flag existir): o perfil diz se a lixeira aparece ou nao.
        api.get('/auth/me/')
            .then((resposta) => {
                setPerfil(resposta.data.perfil);
                setAdmin(resposta.data.is_staff || resposta.data.is_superuser);
            })
            .catch(() => { /* mantem o valor atual da flag */ });
    }, [isAutenticado, setAdmin, setPerfil]);

    useEffect(() => {
        // Sem token não tem nem por que chamar a API.
        if (!isAutenticado) {
            setCarregando(false);
            return;
        }

        async function buscarProjetos() {
            const buscaId = ++buscaIdRef.current;
            try {
                setCarregando(true);
                setErro(null);

                let orderingArray = [];
                if (ordemCronologica === 'recentes') orderingArray.push('-created_at');
                if (ordemCronologica === 'antigos') orderingArray.push('created_at');
                if (ordemAlfabetica === 'asc') orderingArray.push('titulo');
                if (ordemAlfabetica === 'desc') orderingArray.push('-titulo');

                const params = {
                    page: paginaAtual,
                    search: buscaAplicada || undefined,
                    busca_por: tipoBusca,
                    // Backend separa as abas; comum ignora e sempre recebe ativos.
                    excluido: mostrandoExcluidos ? 'true' : 'false',
                };
                if (orderingArray.length > 0) {
                    params.ordering = orderingArray.join(',');
                }

                // O token já é injetado automaticamente pelo interceptor do api.js.
                const resposta = await api.get('/projetos/', { params });
                const dados = resposta.data;

                // A API pagina a resposta, então os itens vêm em "results".
                // O backend já separa ativos/excluídos por aba; o filtro aqui é só defesa para comum.
                const lista = Array.isArray(dados) ? dados : dados.results ?? [];
                // Ignora resposta antiga se outra busca já começou (troca rápida de aba/página).
                if (buscaIdRef.current !== buscaId) {
                    return;
                }
                if (dados && dados.count != undefined) {
                    setTotalPaginas(Math.ceil(dados.count / 6));
                    setTotalProjetos(dados.count);
                } else {
                    setTotalPaginas(1);
                    setTotalProjetos(lista.length);
                }
                setProjetos(isAdmin ? lista : lista.filter((p) => !p.excluido));
            } catch (err) {
                // Ignora erro de busca antiga também.
                if (buscaIdRef.current !== buscaId) {
                    return;
                }
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setErro('Você precisa estar logado para ver seus projetos.');
                } else {
                    setErro(err.response?.data?.detail ?? 'Erro ao buscar projetos.');
                }
            } finally {
                // Só limpa o carregando se for a busca mais recente.
                if (buscaIdRef.current === buscaId) {
                    setCarregando(false);
                }
            }
        }

        buscarProjetos();
    }, [isAutenticado, isAdmin, mostrandoExcluidos, paginaAtual, buscaAplicada, tipoBusca, ordemAlfabetica, ordemCronologica]);

    const handleAplicarBusca = (termo) => {
        setPaginaAtual(1);
        setBuscaAplicada(termo);
    };

    const handleTipoBuscaChange = (novoTipo) => {
        setTipoBusca(novoTipo);
        setPaginaAtual(1);
    };

    const handleOrdemAlfabeticaChange = (novaOrdem) => {
        setOrdemAlfabetica(novaOrdem);
        setPaginaAtual(1);
    };

    const handleOrdemCronologicaChange = (novaOrdem) => {
        setOrdemCronologica(novaOrdem);
        setPaginaAtual(1);
    };

    const handleTrocarAba = (excluidos) => {
        setMostrandoExcluidos(excluidos);
        setPaginaAtual(1);
        setProjetos([]);
    };

    // Comum nunca fica na lixeira: se perder o admin, volta aos ativos.
    useEffect(() => {
        if (!isAdmin && mostrandoExcluidos) {
            setMostrandoExcluidos(false);
            setPaginaAtual(1);
        }
    }, [isAdmin, mostrandoExcluidos]);

    const textoContador = buscaAplicada
        ? `${totalProjetos} ${totalProjetos === 1 ? 'resultado' : 'resultados'} para "${buscaAplicada}"`
        : `${totalProjetos} ${totalProjetos === 1 ? 'projeto' : 'projetos'}`;

    return (
        <div>
            <div className="container mt-4 mb-5 pb-4">
                {/* O menu ja diz em que tela a pessoa esta, entao o titulo nao
                aparece de novo aqui. Ele continua no html, escondido, porque a
                pagina precisa de um h1 para quem usa leitor de tela. */}
                <h1 className="visually-hidden">Seus projetos</h1>

                {isAutenticado && (
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        {isAdmin ? (
                            <div className="btn-group" role="group" aria-label="Filtrar projetos ativos ou excluídos">
                                <button
                                    type="button"
                                    className={`btn ${!mostrandoExcluidos ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                    onClick={() => handleTrocarAba(false)}
                                >
                                    Ativos
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${mostrandoExcluidos ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                    onClick={() => handleTrocarAba(true)}
                                >
                                    <i className="bi bi-trash me-1" aria-hidden="true"></i>
                                    Excluídos
                                </button>
                            </div>
                        ) : (
                            <span />
                        )}
                        {periodoFechadoParaComum ? (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                title="Criação indisponível fora do período de extensão"
                                aria-label="Criação de projeto indisponível fora do período de extensão. Ativar para ver o motivo."
                                onClick={() => setMostrarFeedbackPeriodo(true)}
                            >
                                <i className="bi bi-lock-fill me-2" aria-hidden="true"></i>
                                Novo projeto
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={redirecionaProCadastro}
                            >
                                <i className="bi bi-plus-lg me-2" aria-hidden="true"></i>
                                Novo projeto
                            </button>
                        )}
                    </div>
                )}

                {isAutenticado && !erro && (carregando || projetos.length > 0 || buscaAplicada) && (
                    <p className="text-muted small mt-2 mb-0" role="status">{textoContador}</p>
                )}


                {!isAutenticado && (
                    <div className="alert alert-warning mt-3">
                        Você precisa estar logado para ver seus projetos.
                    </div>
                )}

                {isAutenticado && !periodoLoading && !periodoAberto && periodoFechadoParaComum && (
                    <div className="alert alert-warning mt-3 d-flex flex-wrap align-items-center gap-2" role="status">
                        <i className="bi bi-lock-fill" aria-hidden="true"></i>
                        <span className="flex-grow-1">
                            O período de extensão está fechado: não é possível criar nem editar projetos.
                        </span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setMostrarFeedbackPeriodo(true)}
                        >
                            Ver motivo
                        </button>
                    </div>
                )}

                {isAutenticado && isAdmin && !periodoLoading && !periodoAberto && (
                    <div className="alert alert-info mt-3" role="status">
                        <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
                        O período de extensão está fechado, mas como admin você ainda pode criar e editar.
                    </div>
                )}

                {isAutenticado && erro && (
                    <div className="alert alert-danger mt-3">{erro}</div>
                )}

                {isAutenticado && !erro && (projetos.length > 0 || buscaAplicada || carregando) && (
                    <div className="container mt-4 mb-4 px-0">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-10 col-lg-8">
                                <BarraDeBusca
                                    tipoBusca={tipoBusca}
                                    onBuscar={handleAplicarBusca}
                                />

                                <FiltrosDeOrdenacao
                                    tipoBusca={tipoBusca}
                                    onTipoBuscaChange={handleTipoBuscaChange}
                                    ordemAlfabetica={ordemAlfabetica}
                                    onOrdemAlfabeticaChange={handleOrdemAlfabeticaChange}
                                    ordemCronologica={ordemCronologica}
                                    onOrdemCronologicaChange={handleOrdemCronologicaChange}
                                    isAdmin={isAdmin}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isAutenticado && carregando && projetos.length === 0 && (
                    <div className="mt-3" role="status">
                        <span className="visually-hidden">Carregando projetos...</span>
                        <div className="row g-3" aria-hidden="true">
                            {[0, 1, 2, 3].map((indice) => (
                                <div className="col-12 col-lg-6" key={`skeleton-${indice}`}>
                                    <div className="card shadow border-0 h-100" style={{ backgroundColor: 'var(--cor-fundo)' }}>
                                        <div className="card-body d-flex flex-column placeholder-wave">
                                            <span className="placeholder col-8 mb-2"></span>
                                            <span className="placeholder col-4 mb-3"></span>
                                            <span className="placeholder col-11 mb-1"></span>
                                            <span className="placeholder col-9 mb-1"></span>
                                            <span className="placeholder col-10 mb-3"></span>
                                            <div className="d-flex gap-2 mt-auto pt-3 border-top">
                                                <span className="placeholder col-3 py-3"></span>
                                                <span className="placeholder col-3 py-3"></span>
                                                <span className="placeholder col-3 py-3"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isAutenticado && !carregando && !erro && projetos.length === 0 && (
                    <p className="mt-3 text-muted">
                        {mostrandoExcluidos ? 'Nenhum projeto excluído.' : 'Nenhum projeto encontrado.'}
                    </p>
                )}

                {isAutenticado && carregando && projetos.length > 0 && (
                    <div className="d-flex align-items-center mt-3 text-muted" role="status" aria-live="polite">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                        <span>Carregando projetos...</span>
                    </div>
                )}

                {isAutenticado && !erro && projetos.length > 0 && (
                    <div style={{ opacity: carregando ? 0.5 : 1, transition: 'opacity 0.3s', pointerEvents: carregando ? 'none' : 'auto' }}>
                        {/* Visão de Cartões para Todos os Dispositivos */}
                        <div className="mt-3">
                            <div className="row g-3">
                                {projetos.map((projeto) => (
                                    <ProjetoCard
                                        key={`card-${projeto.id}`}
                                        projeto={projeto}
                                        excluindo={excluindoId === projeto.id}
                                        baixando={baixandoId === projeto.id}
                                        onVer={setVendoId}
                                        onBaixar={handleBaixar}
                                        onEditar={redirecionaParaEdicao}
                                        onExcluir={(projeto) => setConfirmacaoPendente({ tipo: 'excluir', projeto })}
                                        onRestaurar={(projeto) => setConfirmacaoPendente({ tipo: 'restaurar', projeto })}
                                        isAdmin={isAdmin}
                                        periodoBloqueado={periodoFechadoParaComum}
                                        onAcaoBloqueada={() => setMostrarFeedbackPeriodo(true)}
                                    />
                                ))}
                            </div>
                        </div>

                        <Paginacao
                            paginaAtual={paginaAtual}
                            totalPaginas={totalPaginas}
                            onMudarPagina={setPaginaAtual}
                        />

                        {vendoId && (
                            <DialogoDadosProjeto projetoId={vendoId} aoFechar={() => setVendoId(null)} />
                        )}

                        {confirmacaoPendente && (
                            <ModalAlerta
                                variante="aviso"
                                titulo={confirmacaoPendente.tipo === 'excluir' ? 'Excluir projeto?' : 'Restaurar projeto?'}
                                mensagem={confirmacaoPendente.tipo === 'excluir'
                                    ? `Excluir o projeto "${confirmacaoPendente.projeto.titulo}"? Ele irá para a lixeira.`
                                    : `Restaurar o projeto "${confirmacaoPendente.projeto.titulo}"? Ele voltará para a lista normal.`}
                                textoConfirmar={confirmacaoPendente.tipo === 'excluir' ? 'Excluir' : 'Restaurar'}
                                classeBotaoConfirmar={confirmacaoPendente.tipo === 'excluir' ? 'btn-danger' : 'btn-success'}
                                aoConfirmar={confirmarPendente}
                                confirmando={excluindoId === confirmacaoPendente.projeto.id}
                                aoFechar={() => setConfirmacaoPendente(null)}
                            />
                        )}
                    </div>
                )}

                {mostrarFeedbackPeriodo && (
                    <FeedbackIndisponivel
                        inicio={periodo?.inicio}
                        fim={periodo?.fim}
                        mensagem={periodo?.mensagem_fechado}
                        aoFechar={() => setMostrarFeedbackPeriodo(false)}
                    />
                )}

                {toast && (
                    <ToastSucesso mensagem={toast} aoFechar={() => setToast(null)} />
                )}

            </div>
        </div>
    );
}

export default Projetos;
