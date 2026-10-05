import React from 'react';

function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
    if (totalPaginas <= 1) return null;

    function irParaPagina(novaPagina, evento) {
        if (evento) evento.preventDefault();
        if (novaPagina >= 1 && novaPagina <= totalPaginas) {
            onMudarPagina(novaPagina);
        }
    }

    return (
        <nav aria-label="Navegação de páginas" className="mt-5">
            <ul className="pagination justify-content-center">
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
    );
}

export default Paginacao;
