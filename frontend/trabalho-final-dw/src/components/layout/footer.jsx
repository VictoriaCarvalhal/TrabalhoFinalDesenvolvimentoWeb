import React from 'react';
import dirextLogo from '../../assets/dirext_logo.png';
import dgtiLogo from '../../assets/dgti_logo.png';

function Footer() {
    return (
        <footer className="container-fluid py-4 border-top bg-white">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between px-3 gap-4">

                {/* Coluna esquerda */}
                <div className="d-flex justify-content-center justify-content-md-start w-100" style={{ flex: 1 }}>
                    <a href='https://www.depext.uerj.br' target="_blank" rel="noopener noreferrer"><img src={dirextLogo} alt="Logo DIREXT" className="img-fluid" style={{ maxWidth: '120px' }} /></a>
                </div>

                {/* Coluna central */}
                <div className="text-center w-100" style={{ flex: 2 }}>
                    <p className="mb-1 fw-bold" style={{ color: '#487596' }}>Universidade do Rio de Janeiro - Sistema de Extensão</p>
                    <p className="mb-1 text-secondary" style={{ fontSize: '14px' }}>Copyright &copy; 2026/2035 - Todos os direitos reservados</p>
                    <p className="mb-0 text-muted small">Última modificação: 06/09/2026</p>
                </div>

                {/* Coluna direita */}
                <div className="d-flex justify-content-center justify-content-md-end w-100" style={{ flex: 1 }}>
                    <a href='https://www.dgti.uerj.br' target="_blank" rel="noopener noreferrer"><img src={dgtiLogo} alt="Logo DGTI" className="img-fluid" style={{ maxWidth: '120px' }} /></a>
                </div>

            </div>
        </footer>
    );
}

export default Footer;