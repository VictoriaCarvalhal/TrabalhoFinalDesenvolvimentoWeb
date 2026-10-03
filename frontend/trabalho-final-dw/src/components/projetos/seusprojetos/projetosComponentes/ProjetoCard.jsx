import React from 'react';

function ProjetoCard({ projeto, excluindo, onVer, onImprimir, onEditar, onExcluir, onRestaurar, isAdmin }) {
    const podeEditar = projeto.pode_editar ?? true;
    const podeExcluir = projeto.pode_excluir ?? isAdmin;
    const excluido = Boolean(projeto.excluido);
    return (
        <div className="col-12 col-lg-6">
            <div
                className={`card shadow h-100 ${excluido ? 'border-danger border-2 opacity-75' : 'border-0'}`}
                style={{ backgroundColor: 'var(--cor-fundo)' }}
            >
                <div className="card-body d-flex flex-column">

                    {/* Parte de Cima (Título e Status) */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0 text-break" style={{ color: 'var(--cor-titulo-header)' }}>
                            {projeto.titulo}
                        </h5>
                    </div>
                    <div className="mb-3 d-flex flex-wrap gap-2">
                        <span className="badge bg-secondary">{projeto.situacao_display}</span>
                        {excluido && (
                            <span className="badge bg-danger" aria-label={`Projeto ${projeto.titulo} foi excluído`}>
                                <i className="bi bi-trash me-1" aria-hidden="true"></i>Excluído
                            </span>
                        )}
                    </div>
                    
                    {/* Meio (Detalhes com os rótulos) */}
                    <div className="card-text mb-3 flex-grow-1" style={{ fontSize: '0.9rem', color: 'var(--cor-texto)' }}>
                        <div className="mb-1"><i className="bi bi-calendar-event me-2"></i><strong>Ano/Nº:</strong> {projeto.ano} - {projeto.numero ?? 'S/N'}</div>
                        <div className="mb-1"><i className="bi bi-building me-2"></i><strong>Unidade:</strong> {projeto.unidade_sigla}</div>
                        <div className="mb-1"><i className="bi bi-diagram-3 me-2"></i><strong>Departamento:</strong> {projeto.departamento_nome || 'Sem departamento'}</div>
                        <div className="mb-1"><i className="bi bi-person me-2"></i><strong>Coordenador:</strong> {projeto.coordenador_nome}</div>
                        <div className="mb-1"><i className="bi bi-clock me-2"></i><strong>Atualizado:</strong> {projeto.updated_at ? new Date(projeto.updated_at).toLocaleDateString('pt-BR') : '-'}</div>
                    </div>
                    
                    {/* Parte de Baixo (Ações) */}
                    <div className="d-flex gap-2 justify-content-end mt-auto pt-3 border-top">
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-grow-1"
                            title="Ver os dados do projeto"
                            aria-label={`Ver os dados do projeto ${projeto.titulo}`}
                            onClick={() => onVer(projeto.id)}
                        >
                            <i className="bi bi-eye d-block mb-1"></i> Ver
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-grow-1"
                            title="Imprimir projeto"
                            aria-label={`Imprimir projeto ${projeto.titulo}`}
                            onClick={() => onImprimir(projeto.id)}
                        >
                            <i className="bi bi-printer d-block mb-1"></i> Imprimir
                        </button>
                        {podeEditar && (
                            <button
                                type="button"
                                className="btn btn-outline-primary flex-grow-1"
                                title="Editar projeto"
                                aria-label={`Editar projeto ${projeto.titulo}`}
                                onClick={() => onEditar(projeto.id)}
                            >
                                <i className="bi bi-pencil d-block mb-1"></i> Editar
                            </button>
                        )}
                        {excluido
                            ? (podeExcluir && (
                                <button
                                    type="button"
                                    className="btn btn-outline-success flex-grow-1"
                                    title="Restaurar projeto"
                                    aria-label={`Restaurar projeto ${projeto.titulo}`}
                                    disabled={excluindo}
                                    onClick={() => onRestaurar(projeto)}
                                >
                                    <i className="bi bi-arrow-counterclockwise d-block mb-1"></i> Restaurar
                                </button>
                            ))
                            : (podeExcluir && (
                                <button
                                    type="button"
                                    className="btn btn-outline-danger flex-grow-1"
                                    title="Excluir projeto"
                                    aria-label={`Excluir projeto ${projeto.titulo}`}
                                    disabled={excluindo}
                                    onClick={() => onExcluir(projeto)}
                                >
                                    <i className="bi bi-trash d-block mb-1"></i> Excluir
                                </button>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjetoCard;
