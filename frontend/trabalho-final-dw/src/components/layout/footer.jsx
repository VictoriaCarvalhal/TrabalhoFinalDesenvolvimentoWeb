import React from 'react';
import dirextLogo from '../../assets/dirext_logo.png';
import dgtiLogo from '../../assets/dgti_logo.png';

function Footer() {
    return (
        <footer className="container-fluid py-4 border-top">
            <div className="row align-items-center justify-content-between px-3">

                {/* Coluna esquerda igual à do Header (col-md-3) */}
                <div className="col-4 col-md-3">
                    <img src={dirextLogo} alt="Logo DIREXT" className="img-fluid w-75" />
                </div>

                {/* Coluna central idêntica à do Header (col-md-6) */}
                <div className="col-12 col-md-6 text-center mt-3 mt-md-0">
                    <p className="mb-1">Universidade do Rio de Janeiro - Sistema de Extensão</p>
                    <p className="mb-1">Copyright &copy; 2026/2035 - Todos os direitos reservados</p>
                    <p className="mb-0 text-muted small">Ultima modificacao: 06/09/2026</p>
                </div>

                {/* Coluna direita idêntica à do Header (col-md-3) com text-end */}
                <div className="col-4 col-md-3 text-end">
                    <img src={dgtiLogo} alt="Logo DGTI" className="img-fluid w-75" />
                </div>

            </div>
        </footer>
    );
}

export default Footer;