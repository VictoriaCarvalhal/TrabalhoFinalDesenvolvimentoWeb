import React from 'react';
import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink className="navbar-brand fs-4" to="/">
                                <i className="bi bi-house-fill"></i>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/Projetos">Projetos</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/EmProducao">Eventos</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/EmProducao">Cursos</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/EmProducao">UERJ sem muros</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;