import { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

// A navegação toda fica numa lista só, à esquerda. O botão de tema não entra
// nela: ele é uma ação da tela, não um destino, e ficava parecendo um segundo
// menu quando era mais um item de lista igual aos outros.
function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { tema, alternarTema } = useThemeStore();
    const navigate = useNavigate();
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);
    const logout = useAuthStore((state) => state.logout);

    const fecharDropdown = () => setDropdownOpen(false);

    // Sair limpa o token e devolve para a tela de login.
    const sair = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" id="navbar" aria-label="Menu principal">
            <div className="container-fluid">

                

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
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

                    <div className="navbar-acoes ms-lg-auto d-flex align-items-center gap-2">
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
            </div>
        </nav>
    );
}

export default Navbar;
