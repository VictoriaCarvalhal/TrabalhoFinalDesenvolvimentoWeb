import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { excluirProjeto } from '../../../services/projetoService';
import DialogoDadosProjeto from '../detalhes/DialogoDadosProjeto';

function Projetos() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);

    const [projetos, setProjetos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [excluindoId, setExcluindoId] = useState(null);
    // id do projeto aberto no diálogo de dados; null = diálogo fechado
    const [vendoId, setVendoId] = useState(null);
    const navigate = useNavigate();
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    function redirecionaProCadastro() {
        navigate('/Projetos/CadastrarProjeto');
    }

    function redirecionaParaImpressao(id) {
        navigate(`/Projetos/${id}/imprimir`);
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

        async function buscarProjetos() {
            try {
                setCarregando(true);
                setErro(null);

                // O token já é injetado automaticamente pelo interceptor do api.js.
                const resposta = await api.get('/projetos/', {
                    params: { page: paginaAtual }
                });
                const dados = resposta.data;

                if (dados && dados.count != undefined) {
                    setTotalPaginas(Math.ceil(dados.count / 20));
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
    }, [isAutenticado, paginaAtual]);

    function irParaPagina(novaPagina, evento) {
        if (evento) evento.preventDefault();
        if (novaPagina >= 1 && novaPagina <= totalPaginas) {
            setPaginaAtual(novaPagina);
        }
    }


    return (
        <div>
            <div className="container mt-4">
                {/* O menu ja diz em que tela a pessoa esta, entao o titulo nao
                aparece de novo aqui. Ele continua no html, escondido, porque a
                pagina precisa de um h1 para quem usa leitor de tela. */}


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


                {!isAutenticado && (
                    <div className="alert alert-warning mt-3">
                        Você precisa estar logado para ver seus projetos.
                    </div>
                )}

                {isAutenticado && carregando && (
                    <p className="mt-3">Carregando projetos...</p>
                )}

                {isAutenticado && !carregando && erro && (
                    <div className="alert alert-danger mt-3">{erro}</div>
                )}

                {isAutenticado && !carregando && !erro && projetos.length === 0 && (
                    <p className="mt-3">Você ainda não tem projetos cadastrados.</p>
                )}

                {isAutenticado && !carregando && !erro && (
                    <>

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
                                {projetos.slice(0, projetos.length).map((projeto) => (
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
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Excluir projeto"
                                                    aria-label={`Excluir projeto ${projeto.titulo}`}
                                                    disabled={excluindoId === projeto.id}
                                                    onClick={() => handleExcluir(projeto)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPaginas > 1 && (
                            <nav aria-label="Navegação de páginas">
                                <ul className="pagination justify-content-center">
                                    {/* Botão Anterior */}
                                    <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            href="#"
                                            onClick={(e) => irParaPagina(paginaAtual - 1, e)}
                                            aria-label="Anterior"
                                        >
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>

                                    {/* Renderiza os números das páginas */}
                                    {[...Array(totalPaginas)].map((_, index) => {
                                        const numPagina = index + 1;
                                        return (
                                            <li key={numPagina} className={`page-item ${paginaAtual === numPagina ? 'active' : ''}`}>
                                                <a
                                                    className="page-link"
                                                    href="#"
                                                    onClick={(e) => irParaPagina(numPagina, e)}
                                                >
                                                    {numPagina}
                                                </a>
                                            </li>
                                        );
                                    })}

                                    {/* Botão Próximo */}
                                    <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            href="#"
                                            onClick={(e) => irParaPagina(paginaAtual + 1, e)}
                                            aria-label="Próximo"
                                        >
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        )}

                        {vendoId && (
                            <DialogoDadosProjeto projetoId={vendoId} aoFechar={() => setVendoId(null)} />
                        )}


                    </>
                )}

            </div>
        </div>
    );
}

export default Projetos;
