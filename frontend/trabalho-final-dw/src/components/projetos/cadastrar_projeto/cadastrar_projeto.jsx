import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';

const ABAS = [
    {id: "identificacao", label: "Identificação"},
    {id: "caracterizacao", label: "Caracterização"},
    {id: "parcerias-internas", label: "Parcerias Internas"},
];

function CadastrarProjeto() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);

    const [abaAtiva, setAbaAtiva] = useState("identificacao");

    const [form, setForm] = useState({
        titulo: "",
        coordenador: "",
        area: "",
        publicoAlvo: "",
    });

    function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    }


    return (
        <div className="container mt-4">
            <h1>Cadastro de Projeto</h1>
            {/* Codigo para testar a autenticacao mockada. Use isso para já programar a logica de mostrar os projetos de um especifico usuario.
             Dessa forma quando o codigo do backend estiver pronto só precisamos adaptar e não criar do zero*/}
             <ul className="nav nav-tabs">
                {ABAS.map((aba) => (
                    <li className="nav-item" key={aba.id}>
                    <a
                        className={`nav-link ${abaAtiva === aba.id ? "active" : ""}`}
                        aria-current={abaAtiva === aba.id ? "page" : undefined}
                        href="#"
                        onClick={(e) => {
                        e.preventDefault();
                        setAbaAtiva(aba.id);
                        }}
                        role="button"
                    >
                        {aba.label}
                    </a>
                    </li>
                ))}
            </ul>
            
            <div className="p-3 border rounded bg-light">
                
                {abaAtiva === "identificacao" && (
                    
                    <fieldset>
                        <fieldset className="border rounded p-3 m-2">
                            <legend>Projeto</legend>
                            <div className="mb-3">
                                <label className="form-label">Título do projeto</label>
                                <input
                                type="text"
                                className="form-control"
                                value={form.titulo}
                                onChange={(e) => atualizarCampo("titulo", e.target.value)}
                                />
                            </div>
                        </fieldset>
                        <fieldset className="border rounded p-3 m-2">
                            <legend>Coordenador</legend>
                            <div className="mb-3">
                                <label className="form-label">Matrícula</label>
                                <input type="number" className="form-control"/>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Nome</label>
                                <input
                                type="text"
                                className="form-control"
                                value={form.coordenador}
                                onChange={(e) => atualizarCampo("coordenador", e.target.value)}
                                />
                            </div>
                        </fieldset>
                    </fieldset>
                )}

                {abaAtiva === "caracterizacao" && (
                    <fieldset>
                    <legend>
                        Caracterização
                    </legend>

                    <div className="mb-3">
                        <label className="form-label">Área</label>
                        <input
                        type="text"
                        className="form-control"
                        value={form.area}
                        onChange={(e) => atualizarCampo("area", e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Público-alvo</label>
                        <input
                        type="text"
                        className="form-control"
                        value={form.publicoAlvo}
                        onChange={(e) => atualizarCampo("publicoAlvo", e.target.value)}
                        />
                    </div>
                    </fieldset>
                )}

                {abaAtiva==="parcerias-internas" && (
                    <fieldset>
                        <legend>
                            Parcerias Internas
                        </legend>

                        <div className="mb-3">
                            <label className="form-label">Nome da Instituição</label>
                            <input
                            type="text"
                            className="form-control"
                            value={form.area}
                            onChange={(e) => atualizarCampo("area", e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Sigla da Intituição</label>
                            <input
                            type="text"
                            className="form-control"
                            value={form.sigla}
                            onChange={(e) => atualizarCampo("sigla", e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Unidade</label><br/>
                            <select>
                                <option></option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Departamento</label><br/>
                            <select>
                                <option></option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Participação (no máximo 500 caracteres)</label><br/>
                            <textarea maxlength="500" cols="35"/>
                        </div>


                    </fieldset>

                )}
            </div>

        </div>
    );
}

export default CadastrarProjeto;