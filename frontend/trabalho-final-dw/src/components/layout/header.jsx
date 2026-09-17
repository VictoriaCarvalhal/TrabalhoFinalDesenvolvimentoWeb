import React from 'react';
import pr3Logo from '../../assets/pr3_logo.png';

function Header() {
    return (
        <header className="container-fluid py-3 border-bottom bg-white">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between px-3 gap-3">
                
                <div className="d-flex justify-content-center justify-content-md-start w-100 header-col-side">
                    <a href='https://www.uerj.br' target="_blank" rel="noopener noreferrer"><img src={pr3Logo} aria-label="Logo da Universidade do Estado do Rio de Janeiro, com uma tocha acesa e o número 75 em comemoração aos 75 anos da instituição e ao seu lado o logo da Pró Reitoria de Extensão e Cultura" alt="" title="Logos da UERJ e da PR3" className="img-fluid header-logo" /></a>
                </div>

                <div className="text-center w-100 header-col-center">
                    <h2 className="mb-0 fs-4 fs-md-2 fw-bold header-titulo">Sistema De Extensão</h2>
                </div>

                <div className="d-none d-md-block header-col-side"></div>

            </div>
        </header>
    );
}

export default Header;