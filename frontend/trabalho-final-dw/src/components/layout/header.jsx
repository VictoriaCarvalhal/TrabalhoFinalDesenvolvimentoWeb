import React from 'react';
import uerjLogo from '../../assets/uerj_logo.png';
import pr3Logo from '../../assets/pr3_extensao_logo.png';

function Header() {
    return (
        <header className="container-fluid py-3 border-bottom" style={{ backgroundColor: 'var(--cor-fundo)' }}>
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between px-3 gap-3">

                <div className="d-flex align-items-center justify-content-center justify-content-md-start w-100 header-col-side gap-3">
                    <a
                        href="https://www.uerj.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Site da UERJ (abre em nova aba)"
                    >
                        <img
                            src={uerjLogo}
                            alt="Logo da Universidade do Estado do Rio de Janeiro, com uma tocha acesa, e o número 75 dos 75 anos da instituição"
                            title="UERJ"
                            className="img-fluid header-logo"
                        />
                    </a>

                    <span className="header-separador" aria-hidden="true"></span>

                    <a
                        href="https://www.pr3.uerj.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Site da Pró-Reitoria de Extensão e Cultura (abre em nova aba)"
                    >
                        <img
                            src={pr3Logo}
                            alt="Logo da PR3, Pró-Reitoria de Extensão e Cultura, com a marca dos 45 anos"
                            title="PR3, Pró-Reitoria de Extensão e Cultura"
                            className="img-fluid header-logo"
                        />
                    </a>
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
