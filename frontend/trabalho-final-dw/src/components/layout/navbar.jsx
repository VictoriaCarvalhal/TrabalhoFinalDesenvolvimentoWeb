import { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

function Navbar() {
    const [dropdownTemaOpen, setDropdownTemaOpen] = useState(false);
    const [menuMobileAtivo, setMenuMobileAtivo] = useState('principal');
    const { tema, alternarTema } = useThemeStore();
    const navigate = useNavigate();
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
        navigate('/');
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
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/Bemvindo" onClick={fecharDropdown}>
                                        <i className="bi bi-house-fill me-2" aria-hidden="true"></i>
                                        Início
                                    </NavLink>
                                </li>
                            </ul>

                            <div className="navbar-acoes ms-lg-auto d-flex align-items-center gap-3">
                                {isAutenticado && nomeUsuario && (
                                    <span className="navbar-usuario">{nomeUsuario}</span>
                                )}


                                <div className="dropdown">
                                    <button
                                        type="button"
                                        className={`btn btn-sm navbar-acao dropdown-toggle d-flex align-items-center gap-2 ${dropdownTemaOpen ? 'show' : ''}`}
                                        onClick={() => {
                                            setDropdownTemaOpen(!dropdownTemaOpen);
                                        }}
                                        aria-expanded={dropdownTemaOpen}
                                        title="Alterar tema"
                                    >
                                        <i className={`bi ${tema === 'light' ? 'bi-sun-fill' : 'bi-moon-fill'}`} aria-hidden="true"></i>
                                        <span>Tema</span>
                                    </button>
                                    <ul className={`dropdown-menu dropdown-menu-end ${dropdownTemaOpen ? 'show' : ''}`}>
                                        <li>
                                            <button type="button" className={`dropdown-item d-flex align-items-center justify-content-between gap-2 ${tema === 'light' ? 'active' : ''}`} onClick={() => selecionarTema('light')}>
                                                <span><i className="bi bi-sun-fill me-2"></i>Claro</span>
                                                {tema === 'light' && <i className="bi bi-check2"></i>}
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" className={`dropdown-item d-flex align-items-center justify-content-between gap-2 ${tema === 'dark' ? 'active' : ''}`} onClick={() => selecionarTema('dark')}>
                                                <span><i className="bi bi-moon-fill me-2"></i>Escuro</span>
                                                {tema === 'dark' && <i className="bi bi-check2"></i>}
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {isAutenticado && (
                                    <button type="button" className="btn btn-sm navbar-acao d-flex align-items-center" onClick={sair}>
                                        <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
                                        Sair
                                    </button>
                                )}
                            </div>
                        </div>

    
                        <div className="d-flex d-lg-none flex-column mt-3">

                            {menuMobileAtivo === 'principal' && (
                                <ul className="navbar-nav">
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/Bemvindo" onClick={fecharDropdown} data-bs-dismiss="offcanvas">
                                            <i className="bi bi-house-fill me-2"></i> Início
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className="nav-link text-start w-100 border-0 bg-transparent d-flex justify-content-between align-items-center"
                                            onClick={() => setMenuMobileAtivo('tema')}
                                        >
                                            <span>
                                                <i className={`bi ${tema === 'light' ? 'bi-sun-fill' : 'bi-moon-fill'} me-2`}></i> Tema
                                            </span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                    {isAutenticado && (
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className="nav-link text-start w-100 border-0 bg-transparent d-flex align-items-center"
                                                onClick={sair}
                                                data-bs-dismiss="offcanvas"
                                            >
                                                <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i> Sair
                                            </button>
                                        </li>
                                    )}
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