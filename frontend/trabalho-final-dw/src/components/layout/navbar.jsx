import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { ROTAS } from '../../utils/rotas.js';

function Navbar() {
    const [dropdownTemaOpen, setDropdownTemaOpen] = useState(false);
    const [menuMobileAtivo, setMenuMobileAtivo] = useState('principal');
    const { tema, alternarTema } = useThemeStore();
    const navigate = useNavigate();
    const localizacao = useLocation();
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);
    const logout = useAuthStore((state) => state.logout);

    const fecharDropdown = () => {
        setDropdownTemaOpen(false);
    };

    const selecionarTema = (novoTema) => {
        if (tema !== novoTema) alternarTema();
        setDropdownTemaOpen(false);
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

    const SeletorTemaDesktop = () => {
        return (
            <div className="dropdown">
                <button
                    type="button"
                    className={`btn btn-sm navbar-acao dropdown-toggle d-flex align-items-center gap-2 ${dropdownTemaOpen ? 'show' : ''}`}
                    onClick={() => setDropdownTemaOpen(!dropdownTemaOpen)}
                    aria-expanded={dropdownTemaOpen}
                    title="Alterar tema"
                >
                    <span>Tema</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${dropdownTemaOpen ? 'show' : ''}`}>
                    <li>
                        <button
                            type="button"
                            className={`dropdown-item d-flex align-items-center justify-content-between gap-2 ${tema === 'light' ? 'active' : ''}`}
                            onClick={() => selecionarTema('light')}
                        >
                            <span><i className="bi bi-sun-fill me-2"></i>Claro</span>
                            {tema === 'light' && <i className="bi bi-check2"></i>}
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className={`dropdown-item d-flex align-items-center justify-content-between gap-2 ${tema === 'dark' ? 'active' : ''}`}
                            onClick={() => selecionarTema('dark')}
                        >
                            <span><i className="bi bi-moon-fill me-2"></i>Escuro</span>
                            {tema === 'dark' && <i className="bi bi-check2"></i>}
                        </button>
                    </li>
                </ul>
            </div>
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
                                <NavLinks onClickAction={fecharDropdown} dismissOffCanvas={false} />
                            </ul>

                            <div className="navbar-acoes ms-lg-auto d-flex align-items-center gap-3">
                                {isAutenticado && nomeUsuario && (
                                    <span className="navbar-usuario">{nomeUsuario}</span>
                                )}


                                <SeletorTemaDesktop />

                                <BotaoSair isMobile={false} />
                            </div>
                        </div>


                        <div className="d-flex d-lg-none flex-column mt-3">

                            {menuMobileAtivo === 'principal' && (
                                <ul className="navbar-nav">
                                    <NavLinks onClickAction={fecharDropdown} dismissOffCanvas={true}/>
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