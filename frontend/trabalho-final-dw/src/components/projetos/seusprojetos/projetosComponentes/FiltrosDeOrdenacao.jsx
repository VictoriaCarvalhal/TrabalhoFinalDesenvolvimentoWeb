import React from 'react';

function FiltrosDeOrdenacao({
    tipoBusca,
    onTipoBuscaChange,
    ordemAlfabetica,
    onOrdemAlfabeticaChange,
    ordemCronologica,
    onOrdemCronologicaChange,
    isAdmin,
}) {
    return (
        <div className="mt-3 d-flex flex-column flex-xl-row justify-content-between gap-3">
            <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted small fw-bold">Pesquisar por:</span>
                <div className="btn-group btn-group-sm">
                    <input type="radio" className="btn-check" name="btnBusca" id="btnBusca1" checked={tipoBusca === 'nome'} onChange={() => onTipoBuscaChange('nome')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnBusca1">Nome</label>
                    
                    <input type="radio" className="btn-check" name="btnBusca" id="btnBuscaUnidade" checked={tipoBusca === 'unidade'} onChange={() => onTipoBuscaChange('unidade')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnBuscaUnidade">Unidade</label>

                    <input type="radio" className="btn-check" name="btnBusca" id="btnBusca2" checked={tipoBusca === 'departamento'} onChange={() => onTipoBuscaChange('departamento')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnBusca2">Departamento</label>

                    {isAdmin && (
                        <>
                            <input type="radio" className="btn-check" name="btnBusca" id="btnBusca3" checked={tipoBusca === 'coordenador'} onChange={() => onTipoBuscaChange('coordenador')} />
                            <label className="btn btn-outline-secondary" htmlFor="btnBusca3">Coordenador</label>
                        </>
                    )}
                </div>
            </div>
            
            <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted small fw-bold">Ordenar por:</span>
                <div className="btn-group btn-group-sm">
                    <input type="radio" className="btn-check" name="btnAlfa" id="btnAlfa1" checked={ordemAlfabetica === 'asc'} onChange={() => onOrdemAlfabeticaChange('asc')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnAlfa1">A-Z</label>

                    <input type="radio" className="btn-check" name="btnAlfa" id="btnAlfa2" checked={ordemAlfabetica === 'desc'} onChange={() => onOrdemAlfabeticaChange('desc')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnAlfa2">Z-A</label>
                </div>

                <div className="btn-group btn-group-sm">
                    <input type="radio" className="btn-check" name="btnCrono" id="btnCrono1" checked={ordemCronologica === 'recentes'} onChange={() => onOrdemCronologicaChange('recentes')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnCrono1">Mais Recente</label>

                    <input type="radio" className="btn-check" name="btnCrono" id="btnCrono2" checked={ordemCronologica === 'antigos'} onChange={() => onOrdemCronologicaChange('antigos')} />
                    <label className="btn btn-outline-secondary" htmlFor="btnCrono2">Mais Antigo</label>
                </div>
            </div>
        </div>
    );
}

export default FiltrosDeOrdenacao;
