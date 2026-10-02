import React, { useEffect, useState, useRef } from 'react';
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
    const [busca, setBusca] = useState('');
    const [buscaAplicada, setBuscaAplicada] = useState('');
    const [sugestoes, setSugestoes] = useState([]);
    const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const debounceTimeout = useRef(null);

    const [tipoBusca, setTipoBusca] = useState('nome');
    const [ordemAlfabetica, setOrdemAlfabetica] = useState('asc');
    const [ordemCronologica, setOrdemCronologica] = useState('recentes');

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
    }, [isAutenticado, paginaAtual, buscaAplicada, tipoBusca, ordemAlfabetica, ordemCronologica]);

    const handleBuscar = (e) => {
        e.preventDefault();
        setPaginaAtual(1);
        setBuscaAplicada(busca);
        setMostrarSugestoes(false);
    };

    const handleBuscaChange = (e) => {
        const valor = e.target.value;
        setBusca(valor);

        if (valor.trim() === '') {
            setBuscaAplicada('');
            setPaginaAtual(1);
            setSugestoes([]);
            setMostrarSugestoes(false);
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            return;
        }

        if (valor.trim().length > 1) {
            setCarregandoSugestoes(true);
            setMostrarSugestoes(true);
            
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            
            debounceTimeout.current = setTimeout(async () => {
                try {
                    const resposta = await api.get('/projetos/', {
                        params: { search: valor, page: 1, busca_por: tipoBusca }
                    });
                    const dados = resposta.data;
                    const lista = Array.isArray(dados) ? dados : dados.results ?? [];
                    setSugestoes(lista.slice(0, 5));
                } catch (err) {
                    console.error("Erro ao buscar sugestões", err);
                } finally {
                    setCarregandoSugestoes(false);
                }
            }, 300);
        } else {
            setSugestoes([]);
            setMostrarSugestoes(false);
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        }
    };

    const handleSelecionarSugestao = (projeto) => {
        let selecionado = projeto.titulo;
        if (tipoBusca === 'coordenador') selecionado = projeto.coordenador_nome;
        if (tipoBusca === 'unidade') selecionado = projeto.unidade_sigla;
        if (tipoBusca === 'departamento') selecionado = projeto.departamento_nome || 'Sem departamento';

        setBusca(selecionado);
        setMostrarSugestoes(false);
        setPaginaAtual(1);
        setBuscaAplicada(selecionado);
    };

    function irParaPagina(novaPagina, evento) {
        if (evento) evento.preventDefault();
        if (novaPagina >= 1 && novaPagina <= totalPaginas) {
            setPaginaAtual(novaPagina);
        }
    }


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
                                <form className="card card-sm shadow-sm border-0" onSubmit={handleBuscar} style={{ backgroundColor: 'var(--cor-fundo)' }}>
                                    <div className="card-body row g-0 align-items-center">
                                        <div className="col-auto me-3 ms-2">
                                            <i className="bi bi-search h5 mb-0 text-muted"></i>
                                        </div>
                                        <div className="col position-relative">
                                            <input 
                                                className="form-control form-control-lg border-0 bg-transparent" 
                                                type="search" 
                                                placeholder="Pesquisar projetos pelo nome..."
                                                value={busca}
                                                onChange={handleBuscaChange}
                                                onFocus={() => {
                                                    if (busca.trim().length > 1) setMostrarSugestoes(true);
                                                }}
                                                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                                                style={{ boxShadow: 'none', color: 'var(--cor-texto)' }}
                                            />
                                            {mostrarSugestoes && (
                                                <ul className="list-group position-absolute w-100 shadow" style={{ top: '100%', left: 0, zIndex: 1000 }}>
                                                    {carregandoSugestoes && (
                                                        <li className="list-group-item text-muted text-center py-2">
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Buscando...
                                                        </li>
                                                    )}
                                                    {!carregandoSugestoes && sugestoes.length === 0 && (
                                                        <li className="list-group-item text-muted py-2">Nenhum projeto encontrado.</li>
                                                    )}
                                                    {!carregandoSugestoes && sugestoes.map((projeto) => {
                                                        let textoPrincipal = projeto.titulo;
                                                        let textoSecundario = `${projeto.ano} - ${projeto.situacao_display}`;
                                                        
                                                        if (tipoBusca === 'coordenador') {
                                                            textoPrincipal = projeto.coordenador_nome;
                                                            textoSecundario = projeto.titulo;
                                                        } else if (tipoBusca === 'unidade') {
                                                            textoPrincipal = projeto.unidade_sigla;
                                                            textoSecundario = projeto.titulo;
                                                        } else if (tipoBusca === 'departamento') {
                                                            textoPrincipal = projeto.departamento_nome || 'Sem departamento';
                                                            textoSecundario = projeto.titulo;
                                                        }

                                                        return (
                                                            <button
                                                                key={projeto.id}
                                                                type="button"
                                                                className="list-group-item list-group-item-action text-start"
                                                                onClick={() => handleSelecionarSugestao(projeto)}
                                                            >
                                                                <div className="fw-bold text-truncate" style={{ color: 'var(--cor-link)' }}>{textoPrincipal}</div>
                                                                <small className="text-muted">{textoSecundario}</small>
                                                            </button>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="col-auto me-2">
                                            <button className="btn btn-lg btn-primary text-white" type="submit">Pesquisar</button>
                                        </div>
                                    </div>
                                </form>
                                
                                {/* Filtros e Ordenação */}
                                <div className="mt-3 d-flex flex-column flex-xl-row justify-content-between gap-3">
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <span className="text-muted small fw-bold">Pesquisar por:</span>
                                        <div className="btn-group btn-group-sm">
                                            <input type="radio" className="btn-check" name="btnBusca" id="btnBusca1" checked={tipoBusca === 'nome'} onChange={() => {setTipoBusca('nome'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnBusca1">Nome</label>
                                            
                                            <input type="radio" className="btn-check" name="btnBusca" id="btnBuscaUnidade" checked={tipoBusca === 'unidade'} onChange={() => {setTipoBusca('unidade'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnBuscaUnidade">Unidade</label>

                                            <input type="radio" className="btn-check" name="btnBusca" id="btnBusca2" checked={tipoBusca === 'departamento'} onChange={() => {setTipoBusca('departamento'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnBusca2">Departamento</label>

                                            <input type="radio" className="btn-check" name="btnBusca" id="btnBusca3" checked={tipoBusca === 'coordenador'} onChange={() => {setTipoBusca('coordenador'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnBusca3">Coordenador</label>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <span className="text-muted small fw-bold">Ordenar por:</span>
                                        <div className="btn-group btn-group-sm">
                                            <input type="radio" className="btn-check" name="btnAlfa" id="btnAlfa1" checked={ordemAlfabetica === 'asc'} onChange={() => {setOrdemAlfabetica('asc'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnAlfa1">A-Z</label>

                                            <input type="radio" className="btn-check" name="btnAlfa" id="btnAlfa2" checked={ordemAlfabetica === 'desc'} onChange={() => {setOrdemAlfabetica('desc'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnAlfa2">Z-A</label>
                                        </div>

                                        <div className="btn-group btn-group-sm">
                                            <input type="radio" className="btn-check" name="btnCrono" id="btnCrono1" checked={ordemCronologica === 'recentes'} onChange={() => {setOrdemCronologica('recentes'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnCrono1">Mais Recente</label>

                                            <input type="radio" className="btn-check" name="btnCrono" id="btnCrono2" checked={ordemCronologica === 'antigos'} onChange={() => {setOrdemCronologica('antigos'); setPaginaAtual(1);}} />
                                            <label className="btn btn-outline-secondary" htmlFor="btnCrono2">Mais Antigo</label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {isAutenticado && !carregando && !erro && projetos.length === 0 && (
                    <p className="mt-3 text-muted">Nenhum projeto encontrado.</p>
                )}

                {isAutenticado && !erro && projetos.length > 0 && (

                    


                    <div style={{ opacity: carregando ? 0.5 : 1, transition: 'opacity 0.3s', pointerEvents: carregando ? 'none' : 'auto' }}>
                        {/* Visão de Cartões para Todos os Dispositivos */}
                        <div className="mt-3">
                            <div className="row g-3">
                                {projetos.slice(0, projetos.length).map((projeto) => (
                                    <div className="col-12 col-lg-6" key={`card-${projeto.id}`}>
                                        <div className="card shadow h-100 border-0" style={{ backgroundColor: 'var(--cor-fundo)' }}>
                                            <div className="card-body d-flex flex-column">
                                                
                                                {/* Parte de Cima (Título e Status) */}
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="card-title fw-bold mb-0 text-break" style={{ color: 'var(--cor-titulo-header)' }}>
                                                        {projeto.titulo}
                                                    </h5>
                                                </div>
                                                <div className="mb-3">
                                                    <span className="badge bg-secondary">{projeto.situacao_display}</span>
                                                </div>
                                                
                                                {/* Meio (Detalhes com os rótulos) */}
                                                <div className="card-text mb-3 flex-grow-1" style={{ fontSize: '0.9rem', color: 'var(--cor-texto)' }}>
                                                    <div className="mb-1"><i className="bi bi-calendar-event me-2"></i><strong>Ano/Nº:</strong> {projeto.ano} - {projeto.numero ?? 'S/N'}</div>
                                                    <div className="mb-1"><i className="bi bi-building me-2"></i><strong>Unidade:</strong> {projeto.unidade_sigla}</div>
                                                    <div className="mb-1"><i className="bi bi-diagram-3 me-2"></i><strong>Departamento:</strong> {projeto.departamento_nome || 'Sem departamento'}</div>
                                                    <div className="mb-1"><i className="bi bi-person me-2"></i><strong>Coord:</strong> {projeto.coordenador_nome}</div>
                                                    <div className="mb-1"><i className="bi bi-clock me-2"></i><strong>Atualizado:</strong> {projeto.updated_at ? new Date(projeto.updated_at).toLocaleDateString('pt-BR') : '-'}</div>
                                                </div>
                                                
                                                {/* Parte de Baixo (Ações) */}
                                                <div className="d-flex gap-2 justify-content-end mt-auto pt-3 border-top">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary flex-grow-1"
                                                        title="Ver os dados do projeto"
                                                        onClick={() => setVendoId(projeto.id)}
                                                    >
                                                        <i className="bi bi-eye d-block mb-1"></i> Ver
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary flex-grow-1"
                                                        title="Imprimir projeto"
                                                        onClick={() => redirecionaParaImpressao(projeto.id)}
                                                    >
                                                        <i className="bi bi-printer d-block mb-1"></i> Imprimir
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger flex-grow-1"
                                                        title="Excluir projeto"
                                                        disabled={excluindoId === projeto.id}
                                                        onClick={() => handleExcluir(projeto)}
                                                    >
                                                        <i className="bi bi-trash d-block mb-1"></i> Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {totalPaginas > 1 && (
                            <nav aria-label="Navegação de páginas" className="mt-5">
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


                    </div>
                )}

            </div>
        </div>
    );
}

export default Projetos;
