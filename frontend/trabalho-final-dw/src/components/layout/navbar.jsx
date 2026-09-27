import { useState } from 'react';
import { NavLink } from "react-router-dom";
import { useThemeStore } from '../../stores/themeStore';

function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { tema, alternarTema } = useThemeStore();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" id="navbar">
            <div className="container-fluid">

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/Bemvindo">
                                <i className="bi bi-house-fill"></i>
                            </NavLink>
                        </li>
                        <li className="nav-item dropdown">
                            <a 
                                className={`nav-link dropdown-toggle ${dropdownOpen ? 'show' : ''}`} 
                                href="#" 
                                role="button" 
                                onClick={(e) => { e.preventDefault(); setDropdownOpen(!dropdownOpen); }}
                                aria-expanded={dropdownOpen}
                            >
                                Projetos
                            </a>
                            <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                <li><NavLink className="dropdown-item" to="/Projetos/SeusProjetos" onClick={() => setDropdownOpen(false)}>Seus Projetos</NavLink></li>
                                <li><NavLink className="dropdown-item" to="/Projetos/AvaliarProjetos" onClick={() => setDropdownOpen(false)}>Avaliar Projetos</NavLink></li>
                            </ul>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link" 
                                onClick={(e) => { e.preventDefault(); alternarTema(); }}
                                title={tema === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
                            >
                                <i className={`bi ${tema === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`}></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;