import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { excluirProjeto } from '../../../services/projetoService';
import DialogoDadosProjeto from '../detalhes/DialogoDadosProjeto';
import BarraDeBusca from './projetosComponentes/BarraDeBusca';
import FiltrosDeOrdenacao from './projetosComponentes/FiltrosDeOrdenacao';
import ProjetoCard from './projetosComponentes/ProjetoCard';
import Paginacao from './projetosComponentes/Paginacao';

function Projetos() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const setAdmin = useAuthStore((state) => state.setAdmin);
    const perfil = useAuthStore((state) => state.perfil);
    const isAdmin = perfil === 'admin';

    const [projetos, setProjetos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [excluindoId, setExcluindoId] = useState(null);
    // id do projeto aberto no diálogo de dados; null = diálogo fechado
    const [vendoId, setVendoId] = useState(null);
    const navigate = useNavigate();
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [buscaAplicada, setBuscaAplicada] = useState('');

    const [tipoBusca, setTipoBusca] = useState('nome');
    const [ordemAlfabetica, setOrdemAlfabetica] = useState('asc');
    const [ordemCronologica, setOrdemCronologica] = useState('recentes');

    function redirecionaProCadastro() {
        navigate('/Projetos/CadastrarProjeto');
    }

    function redirecionaParaImpressao(id) {
        navigate(`/Projetos/${id}/imprimir`);
    }

    function redirecionaParaEdicao(id){
        navigate(`/Projetos/${id}/editar`);
    }

    async function handleExcluir(projeto) {
        if (!window.confirm(`Excluir o projeto "${projeto.titulo}"? Ele será ocultado da lista.`)) {
            return;
        }
        setExcluindoId(projeto.id);
        setErro(null);
        try {
            await excluirProjeto(projeto.id);
            setProjetos((atuais) => atuais.filter((p) => p.id !== projeto.id));
        } catch (err) {
            setErro(err.response?.data?.detail ?? 'Erro ao excluir projeto.');
        } finally {
            setExcluindoId(null);
        }
    }

    useEffect(() => {
        // Sem token não tem nem por que chamar a API.
        if (!isAutenticado) {
            setCarregando(false);
            return;
        }

        // Garante a flag de admin mesmo para sessoes antigas (logadas antes
        // de a flag existir): o perfil diz se a lixeira aparece ou nao.
        api.get('/auth/me/')
            .then((perfil) => {
                setAdmin(perfil.data.is_staff || perfil.data.is_superuser);
            })
            .catch(() => { /* mantem o valor atual da flag */ });

        async function buscarProjetos() {
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
                };
                if (orderingArray.length > 0) {
                    params.ordering = orderingArray.join(',');
                }

                // O token já é injetado automaticamente pelo interceptor do api.js.
                const resposta = await api.get('/projetos/', { params });
                const dados = resposta.data;

                if (dados && dados.count != undefined) {
                    setTotalPaginas(Math.ceil(dados.count / 6));
                } else {
                    setTotalPaginas(1);
                }

                // A API pagina a resposta (PAGE_SIZE: 20), então os itens vêm em "results".
                // Filtro defensivo: o backend já oculta excluido=True, mas garante aqui também.
                const lista = Array.isArray(dados) ? dados : dados.results ?? [];
                setProjetos(lista.filter((p) => !p.excluido));
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setErro('Você precisa estar logado para ver seus projetos.');
                } else {
                    setErro(err.response?.data?.detail ?? 'Erro ao buscar projetos.');
                }
            } finally {
                setCarregando(false);
            }
        }

        buscarProjetos();
    }, [isAutenticado, setAdmin]);
    }, [isAutenticado, paginaAtual, buscaAplicada, tipoBusca, ordemAlfabetica, ordemCronologica]);

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

    const carregandoInicial = carregando && projetos.length === 0 && !buscaAplicada;

    return (
        <div>
            <div className="container mt-4 mb-5 pb-4">
                {/* O menu ja diz em que tela a pessoa esta, entao o titulo nao
                aparece de novo aqui. Ele continua no html, escondido, porque a
                pagina precisa de um h1 para quem usa leitor de tela. */}


                {!carregandoInicial && (
                    <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={redirecionaProCadastro}
                        >
                            <i className="bi bi-plus-lg me-2" aria-hidden="true"></i>
                            Novo projeto
                        </button>
                    </div>
                )}


                {!isAutenticado && (
                    <div className="alert alert-warning mt-3">
                        Você precisa estar logado para ver seus projetos.
                    </div>
                )}

                {isAutenticado && carregando && projetos.length === 0 && (
                    <div className="d-flex align-items-center mt-3 text-muted">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                        <span>Carregando projetos...</span>
                    </div>
                )}

                {isAutenticado && erro && (
                    <div className="alert alert-danger mt-3">{erro}</div>
                )}

                {isAutenticado && !erro && !carregandoInicial && (projetos.length > 0 || buscaAplicada) && (
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

                {isAutenticado && !carregando && !erro && projetos.length === 0 && (
                    <p className="mt-3 text-muted">Nenhum projeto encontrado.</p>
                )}

                {isAutenticado && !carregando && !erro && projetos.length > 0 && (
                    <>
                        <div className={controlFade? "table-fade" : ""}>
                            <table className="table table-striped table-hover mt-3">
                                <thead>
                                    <tr>
                                        <th>Ano</th>
                                        <th>Número</th>
                                        <th>Título</th>
                                        <th>Situação</th>
                                        <th>Unidade</th>
                                        <th>Coordenador(a)</th>
                                        <th>Atualizado em</th>
                                        <th className="text-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projetos.slice(0, isPrevia ? limite : projetos.length).map((projeto) => (
                                        <tr key={projeto.id}>
                                            <td>{projeto.ano}</td>
                                            <td>{projeto.numero ?? 'S/N'}</td>
                                            <td>{projeto.titulo}</td>
                                            <td>{projeto.situacao_display}</td>
                                            <td>{projeto.unidade_sigla}</td>
                                            <td>{projeto.coordenador_nome}</td>
                                            <td>
                                                {projeto.updated_at
                                                    ? new Date(projeto.updated_at).toLocaleDateString('pt-BR')
                                                    : '-'}
                                            </td>
                                            <td className="text-nowrap">
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        title="Ver os dados do projeto"
                                                        aria-label={`Ver os dados do projeto ${projeto.titulo}`}
                                                        onClick={() => setVendoId(projeto.id)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        title="Imprimir projeto"
                                                        aria-label={`Imprimir projeto ${projeto.titulo}`}
                                                        onClick={() => redirecionaParaImpressao(projeto.id)}
                                                    >
                                                        <i className="bi bi-printer"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Editar projeto"
                                                        aria-label={`Editar projeto ${projeto.titulo}`}
                                                        onClick={() => redirecionaParaEdicao(projeto.id)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    {(projeto.pode_excluir ?? isAdmin) && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Excluir projeto"
                                                            aria-label={`Excluir projeto ${projeto.titulo}`}
                                                            disabled={excluindoId === projeto.id}
                                                            onClick={() => handleExcluir(projeto)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                        onVer={setVendoId}
                                        onImprimir={redirecionaParaImpressao}
                                        onExcluir={handleExcluir}
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
                    </div>
                )}

            </div>
        </div>
    );
}

export default Projetos;
