import React from 'react';
import CampoSomenteLeitura from '../CampoSomenteLeitura';

function Caracterizacao({
        form,
        atualizarCampo,
        naturezas, carregandoNaturezas, erroNaturezas,
        areasCNPQ, carregandoAreasCNPQ, erroAreasCNPQ,
        areasTematicas, carregandoAreasTematicas, erroAreasTematicas,
        linhasExtensao, carregandoLinhasExtensao, erroLinhasExtensao,
        errosValidacao }) {
    return (
        <fieldset>
        <legend>
            Caracterização
        </legend>

        <CampoSomenteLeitura
            rotulo="Situação do projeto"
            valor="Novo"
            ajuda="Todo projeto nasce como novo; a situação muda conforme a análise."
        />

        <div className="mb-3">
            <label className="form-label">É vinculado a Programa de Extensão?</label>
            <div className="form-check">
                <input
                    className={`form-check-input ${errosValidacao?.vinculado_extensao ? 'is-invalid' : ''}`}
                    type="radio"
                    name="vinculado_extensao"
                    id="vinculado_extensao_sim"
                    value="sim"
                    checked={form.vinculado_extensao === "sim"}
                    onChange={(e) => atualizarCampo("vinculado_extensao", e.target.value)}
                />
                <label className="form-check-label" htmlFor="vinculado_extensao_sim">
                    Sim
                </label>
            </div>
            <div className="form-check">
                <input
                    className={`form-check-input ${errosValidacao?.vinculado_extensao ? 'is-invalid' : ''}`}
                    type="radio"
                    name="vinculado_extensao"
                    id="vinculado_extensao_nao"
                    value="nao"
                    checked={form.vinculado_extensao === "nao"}
                    onChange={(e) => atualizarCampo("vinculado_extensao", e.target.value)}
                />
                <label className="form-check-label" htmlFor="vinculado_extensao_nao">
                    Não
                </label>
            </div>
            {errosValidacao?.vinculado_extensao && <div className="invalid-feedback d-block">{errosValidacao.vinculado_extensao}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label">É curricular?</label>
            <div className="form-check">
                <input
                    className={`form-check-input ${errosValidacao?.curricular ? 'is-invalid' : ''}`}
                    type="radio"
                    name="curricular"
                    id="curricular_sim"
                    value="sim"
                    checked={form.curricular === "sim"}
                    onChange={(e) => atualizarCampo("curricular", e.target.value)}
                />
                <label className="form-check-label" htmlFor="curricular_sim">
                    Sim
                </label>
            </div>
            <div className="form-check">
                <input
                    className={`form-check-input ${errosValidacao?.curricular ? 'is-invalid' : ''}`}
                    type="radio"
                    name="curricular"
                    id="curricular_nao"
                    value="nao"
                    checked={form.curricular === "nao"}
                    onChange={(e) => atualizarCampo("curricular", e.target.value)}
                />
                <label className="form-check-label" htmlFor="curricular_nao">
                    Não
                </label>
            </div>
            {errosValidacao?.curricular && <div className="invalid-feedback d-block">{errosValidacao.curricular}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-natureza">Natureza</label>

            <select id="car-natureza"
                className={`form-select ${errosValidacao?.natureza ? 'is-invalid' : ''}`}
                value={form.natureza}
                onChange={(e) => atualizarCampo("natureza", e.target.value)}
            >
                <option value="">Selecione</option>
                {carregandoNaturezas && <option disabled>Carregando...</option>}
                {erroNaturezas && <option disabled>Erro ao carregar naturezas</option>}
                {naturezas.map((natureza) => (
                    <option key={natureza.id} value={natureza.id}>
                        {natureza.descricao}
                    </option>
                ))}
            </select>
            {errosValidacao?.natureza && <div className="invalid-feedback">{errosValidacao.natureza}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-abrangencia">Abrangência</label>

            <select id="car-abrangencia"
                className={`form-select ${errosValidacao?.abrangencia ? 'is-invalid' : ''}`}
                value={form.abrangencia}
                onChange={(e) => atualizarCampo("abrangencia", e.target.value)}
            >
                <option value="">Selecione</option>
                <option value="LOCAL">Local</option>
                <option value="REGIONAL">Regional</option>
                <option value="NACIONAL">Nacional</option>
                <option value="INTERNACIONAL">Internacional</option>
            </select>
            {errosValidacao?.abrangencia && <div className="invalid-feedback">{errosValidacao.abrangencia}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-publico-alvo">Público Alvo</label>
            <textarea
                id="car-publico-alvo"
                className={`form-control ${errosValidacao?.publico_alvo ? 'is-invalid' : ''}`}
                value={form.publico_alvo}
                onChange={(e) => atualizarCampo("publico_alvo", e.target.value)}
            />
            {errosValidacao?.publico_alvo && <div className="invalid-feedback">{errosValidacao.publico_alvo}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-grande-area-de-conhecimento-do-cnpq">Grande Área de Conhecimento do CNPq</label>
            <select id="car-grande-area-de-conhecimento-do-cnpq"
                className={`form-select ${errosValidacao?.area_conhecimento_cnpq ? 'is-invalid' : ''}`}
                value={form.area_conhecimento_cnpq}
                onChange={(e) => atualizarCampo("area_conhecimento_cnpq", e.target.value)}
            >
                <option value="">Selecione</option>
                {carregandoAreasCNPQ && <option disabled>Carregando...</option>}
                {erroAreasCNPQ && <option disabled>Erro ao carregar Áreas do CNPQ</option>}
                {areasCNPQ.map((areaCNPQ) => (
                    <option key={areaCNPQ.codigo} value={areaCNPQ.codigo}>
                        {areaCNPQ.descricao}
                    </option>
                ))}
            </select>
            {errosValidacao?.area_conhecimento_cnpq && <div className="invalid-feedback">{errosValidacao.area_conhecimento_cnpq}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-area-tematica-principal">Área Temática Principal</label>
            <select id="car-area-tematica-principal"
                className={`form-select ${errosValidacao?.area_tematica_principal ? 'is-invalid' : ''}`}
                value={form.area_tematica_principal}
                onChange={(e) => atualizarCampo("area_tematica_principal", e.target.value)}
            >
                <option value="">Selecione</option>
                {carregandoAreasTematicas && <option disabled>Carregando...</option>}
                {erroAreasTematicas && <option disabled>Erro ao carregar Áreas Tematicas</option>}
                {areasTematicas.map((areaTematica) => (
                    <option key={areaTematica.id} value={areaTematica.id}>
                        {areaTematica.descricao}
                    </option>
                ))}
            </select>
            {errosValidacao?.area_tematica_principal && <div className="invalid-feedback">{errosValidacao.area_tematica_principal}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-area-tematica-secundaria">Área Temática Secundária</label>
            <select id="car-area-tematica-secundaria"
                className={`form-select ${errosValidacao?.area_tematica_secundaria ? 'is-invalid' : ''}`}
                value={form.area_tematica_secundaria}
                onChange={(e) => atualizarCampo("area_tematica_secundaria", e.target.value)}
            >
                <option value="">Selecione</option>
                {carregandoAreasTematicas && <option disabled>Carregando...</option>}
                {erroAreasTematicas && <option disabled>Erro ao carregar Áreas Tematicas</option>}
                {areasTematicas.map((areaTematica) => (
                    <option key={areaTematica.id} value={areaTematica.id}>
                        {areaTematica.descricao}
                    </option>
                ))}
            </select>
            {errosValidacao?.area_tematica_secundaria && <div className="invalid-feedback">{errosValidacao.area_tematica_secundaria}</div>}
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor="car-linha-de-extensao">Linha de Extensão</label>
            <select id="car-linha-de-extensao"
                className={`form-select ${errosValidacao?.linha_extensao ? 'is-invalid' : ''}`}
                value={form.linha_extensao}
                onChange={(e) => atualizarCampo("linha_extensao", e.target.value)}
            >
                <option value="">Selecione</option>
                {carregandoLinhasExtensao && <option disabled>Carregando...</option>}
                {erroLinhasExtensao && <option disabled>Erro ao carregar Áreas Tematicas</option>}
                {linhasExtensao.map((linha) => (
                    <option key={linha.id} value={linha.id}>
                        {linha.descricao}
                    </option>
                ))}
            </select>
            {errosValidacao?.linha_extensao && <div className="invalid-feedback">{errosValidacao.linha_extensao}</div>}
        </div>

        </fieldset>
    );
}

export default Caracterizacao;
