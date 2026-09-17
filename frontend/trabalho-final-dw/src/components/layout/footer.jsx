import React from 'react';
import dirextLogo from '../../assets/dirext_logo.png';
import dgtiLogo from '../../assets/dgti_logo.png';

function Footer() {
    return (
        <footer className="container-fluid py-4 border-top bg-white">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between px-3 gap-4">

                {/* Coluna esquerda */}
                <div className="d-flex justify-content-center justify-content-md-start w-100" style={{ flex: 1 }}>
                    <a href='https://www.depext.uerj.br' target="_blank" rel="noopener noreferrer"><img src={dirextLogo} aria-label="Logo da Diretoria de Extensão da Universidade do Estado do Rio de Janeiro com sua sigla DEPEXT e, ao lado da sigla, temos uma imagem que representa a extensão entre dois pontos a partir da formação de um fluído entre eles" alt="" title="Logo do DEPEXT" className="img-fluid" style={{ maxWidth: '120px' }} /></a>
                </div>

                {/* Coluna central */}
                <div className="text-center w-100" style={{ flex: 2 }}>
                    <p className="mb-1 fw-bold" style={{ color: '#487596' }}>Universidade do Rio de Janeiro - Sistema de Extensão</p>
                    <p className="mb-1 text-secondary" style={{ fontSize: '14px' }}>Copyright &copy; 2026/2035 - Todos os direitos reservados</p>
                    <p className="mb-0 text-muted small">Última modificação: 06/09/2026</p>
                </div>

                {/* Coluna direita */}
                <div className="d-flex justify-content-center justify-content-md-end w-100" style={{ flex: 1 }}>
                    <a href='https://www.dgti.uerj.br' target="_blank" rel="noopener noreferrer"><img src={dgtiLogo} aria-label="Logo do Departamento Geral de Tecnologia da Informação com sua sigla DGTI e contendo uma ramificação de rede acima do I" alt="" title="Logo da DGTI" className="img-fluid" style={{ maxWidth: '120px' }} /></a>
                </div>

            </div>
        </footer>
    );
}

export default Footer;