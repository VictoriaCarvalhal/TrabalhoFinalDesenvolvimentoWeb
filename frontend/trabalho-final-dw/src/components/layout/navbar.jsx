import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { ROTAS } from '../../utils/rotas.js';

function Navbar() {
    const [menuMobileAtivo, setMenuMobileAtivo] = useState('principal');
    const { tema, alternarTema } = useThemeStore();
    const navigate = useNavigate();
    const localizacao = useLocation();
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);
    const logout = useAuthStore((state) => state.logout);

    const selecionarTema = (novoTema) => {
        if (tema !== novoTema) alternarTema();
    };

    const sair = () => {
        logout();
        navigate(ROTAS.INICIAL);
    };

    // Clicar em "Início" já estando em /bemvindo não trocava de rota,
    // então nada remontava e o scroll ficava onde estava. Agora força
    // scroll ao topo + remontagem da lista via location.state.
    const irParaInicio = (onClickAction) => (evento) => {
        onClickAction?.();
        if (localizacao.pathname === ROTAS.BEMVINDO) {
            evento.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            navigate(ROTAS.BEMVINDO, { state: { recarregarEm: Date.now() } });
        }
    };

    const NavLinks = ({ onClickAction, dismissOffCanvas }) => {
        // Navbar é usada também no layout deslogado; o link de Início
        // só faz sentido para autenticado (antes caía no ProtectedRoute e voltava).
        if (!isAutenticado) return null;
        return (
            <>
                <li className="nav-item">
                    <NavLink 
                        className="nav-link" 
                        to={ROTAS.BEMVINDO} 
                        onClick={irParaInicio(onClickAction)}
                        data-bs-dismiss={dismissOffCanvas ? "offcanvas" : undefined} 
                    >
                        <i className="bi bi-house-fill me-2"></i> Início
                    </NavLink>
                </li>
                {isAdmin && (
                    <li className="nav-item">
                        <NavLink
                            className="nav-link"
                            to="/Admin/Periodo"
                            onClick={onClickAction}
                            data-bs-dismiss={dismissOffCanvas ? "offcanvas" : undefined}
                        >
                            <i className="bi bi-calendar-range me-2"></i> Período
                        </NavLink>
                    </li>
                )}
            </>
        )
    };

    const BotaoSair = ({ isMobile }) => {
        if (!isAutenticado) return null;

        return (
            <button
                type="button"
                className={`btn ${isMobile ? 'nav-link text-start w-100 border-0 bg-transparent' : 'btn-sm navbar-acao'} d-flex align-items-center`}
                onClick={sair}
            >
                <i className="bi bi-box-arrow-right me-1"></i>Sair
            </button>
        );
    };

    const BotaoTemaDesktop = () => {
        const isClaro = tema === 'light';
        return (
            <button
                type="button"
                className="btn btn-sm navbar-acao d-flex align-items-center justify-content-center"
                onClick={alternarTema}
                title={isClaro ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
                aria-label={isClaro ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
            >
                <i className={`bi ${isClaro ? 'bi-moon-fill' : 'bi-sun-fill'}`}></i>
            </button>
        );
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" id="navbar" aria-label="Menu principal">
            <div className="container-fluid">

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar"
                    aria-controls="offcanvasNavbar"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                    <div className="offcanvas-header d-lg-none border-bottom border-secondary mb-2">
                        <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>

                    <div className="offcanvas-body">

                        <div className="d-none d-lg-flex w-100 align-items-center">
                            <ul className="navbar-nav w-100">
                                <NavLinks dismissOffCanvas={false} />
                            </ul>

                            <div className="navbar-acoes ms-lg-auto d-flex align-items-center gap-3">
                                {isAutenticado && nomeUsuario && (
                                    <span className="navbar-usuario">{nomeUsuario}</span>
                                )}


                                <BotaoTemaDesktop />

                                <BotaoSair isMobile={false} />
                            </div>
                        </div>


                        <div className="d-flex d-lg-none flex-column mt-3">

                            {menuMobileAtivo === 'principal' && (
                                <ul className="navbar-nav">
                                    <NavLinks dismissOffCanvas={true}/>
                                    <li className="nav-item">
                                        <button
                                            className="nav-link text-start w-100 border-0 bg-transparent d-flex justify-content-between align-items-center"
                                            onClick={() => setMenuMobileAtivo('tema')}
                                        >
                                            <span>
                                                 Tema
                                            </span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>

                                    <li className="nav-item">
                                        <BotaoSair isMobile={true}/>
                                    </li>
                                    
                                </ul>
                            )}


                            {menuMobileAtivo === 'tema' && (
                                <ul className="navbar-nav ms-3">
                                    <li className="nav-item">
                                        <button
                                            className="nav-link text-start w-100 border-0 bg-transparent mb-3 d-flex align-items-center"
                                            onClick={() => setMenuMobileAtivo('principal')}
                                        >
                                            <i className="bi bi-chevron-left me-3"></i>
                                            Voltar
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link text-start w-100 border-0 bg-transparent d-flex justify-content-between align-items-center ${tema === 'light' ? 'active' : ''}`}
                                            onClick={() => selecionarTema('light')}
                                            data-bs-dismiss="offcanvas"
                                        >
                                            <span><i className="bi bi-sun-fill me-2"></i> Claro</span>
                                            {tema === 'light' && <i className="bi bi-check2"></i>}
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link text-start w-100 border-0 bg-transparent d-flex justify-content-between align-items-center ${tema === 'dark' ? 'active' : ''}`}
                                            onClick={() => selecionarTema('dark')}
                                            data-bs-dismiss="offcanvas"
                                        >
                                            <span><i className="bi bi-moon-fill me-2"></i> Escuro</span>
                                            {tema === 'dark' && <i className="bi bi-check2"></i>}
                                        </button>
                                    </li>
                                </ul>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;