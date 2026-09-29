import { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuMobileAtivo, setMenuMobileAtivo] = useState('principal');
    const { tema, alternarTema } = useThemeStore();
    const navigate = useNavigate();
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);
    const logout = useAuthStore((state) => state.logout);
    const fecharDropdown = () => setDropdownOpen(false);

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
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <div className="d-none d-lg-flex w-100">
                        <ul className="navbar-nav w-100">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/Bemvindo" onClick={fecharDropdown}>
                                    <i className="bi bi-house-fill me-2" aria-hidden="true"></i>
                                    Início
                                </NavLink>
                            </li>
                            <li className="nav-item dropdown">
                                <button
                                    type="button"
                                    className={`nav-link dropdown-toggle ${dropdownOpen ? 'show' : ''}`}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    aria-expanded={dropdownOpen}
                                >
                                    <i className="bi bi-folder-fill me-2" aria-hidden="true"></i>
                                    Projetos
                                </button>
                                <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                    <li><NavLink className="dropdown-item" to="/Projetos/SeusProjetos" onClick={fecharDropdown}>Seus Projetos</NavLink></li>
                                    <li><NavLink className="dropdown-item" to="/Projetos/CadastrarProjeto" onClick={fecharDropdown}>Cadastrar Projeto</NavLink></li>
                                    <li><NavLink className="dropdown-item" to="/Projetos/AvaliarProjetos" onClick={fecharDropdown}>Avaliar Projetos</NavLink></li>
                                </ul>
                            </li>
                        </ul>
                        <div className="navbar-acoes ms-lg-auto d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 mt-4 mt-lg-0">
                            {isAutenticado && nomeUsuario && (
                                <span className="navbar-usuario d-none d-lg-inline">{nomeUsuario}</span>
                            )}

                            <button
                                type="button"
                                className="btn btn-sm navbar-acao"
                                onClick={alternarTema}
                                aria-label={tema === 'light' ? 'Ativar o modo escuro' : 'Ativar o modo claro'}
                                title={tema === 'light' ? 'Modo escuro' : 'Modo claro'}
                            >
                                <i className={`bi ${tema === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`} aria-hidden="true"></i>
                            </button>

                            {isAutenticado && (
                                <button type="button" className="btn btn-sm navbar-acao" onClick={sair}>
                                    <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
                                    Sair
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="d-flex d-lg-none flex-column mt-3">

                        {menuMobileAtivo === 'principal' ? (
                            <>
                                <ul className="navbar-nav">
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/Bemvindo" onClick={fecharDropdown}>
                                            <i className="bi bi-house-fill me-2"></i> Início
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className="nav-link text-start w-100 border-0 bg-transparent d-flex justify-content-between align-items-center"
                                            onClick={() => setMenuMobileAtivo('projetos')}
                                        >
                                            <span><i className="bi bi-folder-fill me-2"></i> Projetos</span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>

                                <div className="navbar-acoes ms-lg-auto d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 mt-4 mt-lg-0">
                                    {isAutenticado && nomeUsuario && (
                                        <span className="navbar-usuario d-none d-lg-inline">{nomeUsuario}</span>
                                    )}

                                    <button
                                        type="button"
                                        className="btn btn-sm navbar-acao"
                                        onClick={alternarTema}
                                        aria-label={tema === 'light' ? 'Ativar o modo escuro' : 'Ativar o modo claro'}
                                        title={tema === 'light' ? 'Modo escuro' : 'Modo claro'}
                                    >
                                        <i className={`bi ${tema === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`} aria-hidden="true"></i>
                                    </button>

                                    {isAutenticado && (
                                        <button type="button" className="btn btn-sm navbar-acao" onClick={sair}>
                                            <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
                                            Sair
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    className="nav-link text-start w-100 border-0 bg-transparent mb-3 fw-bold text-primary"
                                    onClick={() => setMenuMobileAtivo('principal')}
                                >
                                    <i className="bi bi-arrow-left me-3"></i> 
                                </button>

                                <ul className="navbar-nav ms-3"> 
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/Projetos/SeusProjetos" onClick={fecharDropdown}>Seus Projetos</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/Projetos/CadastrarProjeto" onClick={fecharDropdown}>Cadastrar Projeto</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/Projetos/AvaliarProjetos" onClick={fecharDropdown}>Avaliar Projetos</NavLink>
                                    </li>
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
