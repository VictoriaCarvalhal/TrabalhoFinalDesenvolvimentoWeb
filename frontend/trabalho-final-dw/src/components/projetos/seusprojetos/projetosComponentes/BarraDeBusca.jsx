import React, { useState, useRef } from 'react';
import api from '../../../../services/api';

function BarraDeBusca({ tipoBusca, onBuscar }) {
    const [busca, setBusca] = useState('');
    const [sugestoes, setSugestoes] = useState([]);
    const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const debounceTimeout = useRef(null);

    const handleBuscar = (e) => {
        e.preventDefault();
        setMostrarSugestoes(false);
        onBuscar(busca);
    };

    const handleBuscaChange = (e) => {
        const valor = e.target.value;
        setBusca(valor);

        if (valor.trim() === '') {
            onBuscar('');
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
                    
                    let sugestoesProcessadas = [];
                    if (tipoBusca === 'nome') {
                        sugestoesProcessadas = lista;
                    } else {
                        const vistos = new Set();
                        sugestoesProcessadas = lista.filter(projeto => {
                            let val = '';
                            if (tipoBusca === 'coordenador') val = projeto.coordenador_nome;
                            if (tipoBusca === 'unidade') val = projeto.unidade_sigla;
                            if (tipoBusca === 'departamento') val = projeto.departamento_nome || 'Sem departamento';
                            
                            if (vistos.has(val)) return false;
                            vistos.add(val);
                            return true;
                        });
                    }
                    
                    setSugestoes(sugestoesProcessadas.slice(0, 5));
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
        onBuscar(selecionado);
    };

    return (
        <form className="card card-sm shadow-sm border-0" onSubmit={handleBuscar} style={{ backgroundColor: 'var(--cor-fundo)' }}>
            <div className="card-body row g-0 align-items-center">
                <div className="col-auto me-3 ms-2">
                    <i className="bi bi-search h5 mb-0 text-muted"></i>
                </div>
                <div className="col position-relative">
                    <input 
                        className="form-control form-control-lg border-0 bg-transparent" 
                        type="search" 
                        placeholder="Pesquisar projetos..."
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
                                    textoSecundario = null;
                                } else if (tipoBusca === 'unidade') {
                                    textoPrincipal = projeto.unidade_sigla;
                                    textoSecundario = null;
                                } else if (tipoBusca === 'departamento') {
                                    textoPrincipal = projeto.departamento_nome || 'Sem departamento';
                                    textoSecundario = null;
                                }

                                return (
                                    <button
                                        key={projeto.id}
                                        type="button"
                                        className="list-group-item list-group-item-action text-start"
                                        onClick={() => handleSelecionarSugestao(projeto)}
                                    >
                                        <div className="fw-bold text-truncate" style={{ color: 'var(--cor-link)' }}>{textoPrincipal}</div>
                                        {textoSecundario && <small className="text-muted">{textoSecundario}</small>}
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
    );
}

export default BarraDeBusca;
