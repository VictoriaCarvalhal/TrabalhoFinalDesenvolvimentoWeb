import React, { useState } from 'react';
import ParceriasInternas from './ParceriasInternas';
import ParceriasExternas from './ParceriasExternas';

// As duas parcerias eram etapas separadas do formulário, com o mesmo tipo de
// conteúdo e a mesma forma de preencher. Ficam numa etapa só, dividida em duas
// abinhas, que é o mesmo lugar para a mesma tarefa.
//
// As duas listas continuam montadas o tempo todo, só escondidas, para não
// perder o que foi digitado nem refazer a busca ao trocar de abinha.
function Parcerias({ projetoId, unidades, departamentos, form, atualizarCampo, errosValidacao }) {
    const [aba, setAba] = useState('internas');

    return (
        <fieldset>
            <legend>Parcerias</legend>

            <ul className="nav nav-pills mb-3" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={aba === 'internas'}
                        aria-controls="painel-parcerias-internas"
                        className={`nav-link ${aba === 'internas' ? 'active' : ''}`}
                        onClick={() => setAba('internas')}
                    >
                        Internas
                        {form.parceriasInternas?.length > 0 && (
                            <span className="badge text-bg-light ms-2">{form.parceriasInternas.length}</span>
                        )}
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={aba === 'externas'}
                        aria-controls="painel-parcerias-externas"
                        className={`nav-link ${aba === 'externas' ? 'active' : ''}`}
                        onClick={() => setAba('externas')}
                    >
                        Externas
                        {form.parceriasExternas?.length > 0 && (
                            <span className="badge text-bg-light ms-2">{form.parceriasExternas.length}</span>
                        )}
                    </button>
                </li>
            </ul>

            <div id="painel-parcerias-internas" role="tabpanel" hidden={aba !== 'internas'}>
                <ParceriasInternas
                    projetoId={projetoId}
                    unidades={unidades}
                    departamentos={departamentos}
                    tituloOculto
                    valor={form.parceriasInternas}
                    onChange={(linhas) => atualizarCampo('parceriasInternas', linhas)}
                    errosValidacao={errosValidacao.parceriasInternas}
                />
            </div>

            <div id="painel-parcerias-externas" role="tabpanel" hidden={aba !== 'externas'}>
                <ParceriasExternas
                    projetoId={projetoId}
                    tituloOculto
                    valor={form.parceriasExternas}
                    onChange={(linhas) => atualizarCampo('parceriasExternas', linhas)}
                    errosValidacao={errosValidacao.parceriasExternas}
                />
            </div>
        </fieldset>
    );
}

export default Parcerias;
