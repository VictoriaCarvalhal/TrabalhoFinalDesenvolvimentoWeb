import React, { useState } from 'react';
import { MUNICIPIOS_RJ } from '../../../../dados/municipiosRJ';
import { criarMeuVinculo } from '../../../../services/dominioService';
import CampoContato from '../CampoContato';
import CampoSomenteLeitura from '../CampoSomenteLeitura';

const TIPOS_VINCULO = [
    { valor: 'PROFESSOR_EFETIVO', rotulo: 'Professor Efetivo' },
    { valor: 'PROFESSOR_VISITANTE', rotulo: 'Professor Visitante' },
    { valor: 'PROFESSOR_SUBSTITUTO', rotulo: 'Professor Substituto/Convidado' },
    { valor: 'TECNICO_ADMINISTRATIVO', rotulo: 'Técnico-Administrativo' },
    { valor: 'ALUNO_GRADUACAO', rotulo: 'Aluno de Graduação Não Bolsista' },
    { valor: 'ALUNO_POS_GRADUACAO', rotulo: 'Aluno de Pós-Graduação' },
    { valor: 'EXTERNO', rotulo: 'Externo' },
];

function Identificacao({ form, atualizarCampo, vinculosCoordenador, carregandoVinculos, erroVinculos, recarregarVinculos, unidades, departamentos, buscarCep, buscandoCep, avisoCep, errosValidacao }) {
    const [novoVinculo, setNovoVinculo] = useState({ tipo_vinculo: '', matricula: '' });
    const [salvandoVinculo, setSalvandoVinculo] = useState(false);
    const [erroNovoVinculo, setErroNovoVinculo] = useState(null);
    const semVinculo = !carregandoVinculos && !erroVinculos && vinculosCoordenador.length === 0;

    const departamentosDaUnidade = departamentos.filter(
        (d) => String(d.unidade) === String(form.unidade));
    const semDepartamento = Boolean(form.unidade) && departamentosDaUnidade.length === 0;

    async function cadastrarVinculo(e) {
        e.preventDefault();
        setSalvandoVinculo(true);
        setErroNovoVinculo(null);
        try {
            const resposta = await criarMeuVinculo(novoVinculo);
            await recarregarVinculos?.();
            atualizarCampo('coordenador_vinculo', resposta.data.id);
            atualizarCampo('matricula_coordenador', resposta.data.matricula ?? '');
            atualizarCampo('coordenador', resposta.data.nome_completo ?? '');
            setNovoVinculo({ tipo_vinculo: '', matricula: '' });
        } catch (err) {
            const detalhe = err.response?.data;
            setErroNovoVinculo(detalhe
                ? Object.values(detalhe).flat().join(' ')
                : 'Não foi possível cadastrar o vínculo.');
        } finally {
            setSalvandoVinculo(false);
        }
    }

    function adicionarContato(campo) {
        atualizarCampo(campo, [...form[campo], '']);
    }

    function editarContato(campo, indice, valor) {
        atualizarCampo(campo, form[campo].map((c, i) => (i === indice ? valor : c)));
    }

    function removerContato(campo, indice) {
        atualizarCampo(campo, form[campo].filter((_, i) => i !== indice));
    }

    return (
        <fieldset>
            <legend>Identificação</legend>
            <fieldset className="border rounded p-3 m-2">
                <legend>Projeto</legend>
                <div className="mb-3">
                    <label className="form-label" htmlFor="id-titulo-do-projeto">Título do projeto</label>
                    <input id="id-titulo-do-projeto"
                    type="text"
                    className={`form-control ${errosValidacao?.titulo ? 'is-invalid' : ''}`}
                    value={form.titulo}
                    onChange={(e) => atualizarCampo("titulo", e.target.value)}
                    />
                    {errosValidacao?.titulo && <div className="invalid-feedback">{errosValidacao.titulo}</div>}
                </div>
            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Coordenador</legend>
                <div className="mb-3">
                    <label className="form-label" htmlFor="id-matricula">Matrícula</label>
                    <select id="id-matricula"
                        className={`form-select ${errosValidacao?.coordenador_vinculo ? 'is-invalid' : ''}`}
                        value={form.coordenador_vinculo}
                        onChange={(e) => {
                            const v = vinculosCoordenador.find((x) => x.id === e.target.value);
                            atualizarCampo('coordenador_vinculo', e.target.value);
                            atualizarCampo('matricula_coordenador', v?.matricula ?? '');
                            atualizarCampo('coordenador', v?.nome_completo ?? '');
                        }}
                    >
                        <option value="">Selecione a matrícula</option>
                        {vinculosCoordenador.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.matricula || 'sem matrícula'} - {v.tipo_vinculo_display}
                            </option>
                        ))}
                    </select>
                    {errosValidacao?.coordenador_vinculo && <div className="invalid-feedback">{errosValidacao.coordenador_vinculo}</div>}

                    {carregandoVinculos && (
                        <div className="form-text">Carregando suas matrículas...</div>
                    )}

                    {erroVinculos && (
                        <div className="alert alert-danger py-2 mt-2">
                            Não foi possível carregar suas matrículas.{' '}
                            <button type="button" className="btn btn-sm btn-link p-0 align-baseline" onClick={recarregarVinculos}>
                                Tentar de novo
                            </button>
                        </div>
                    )}

                    {semVinculo && (
                        <div className="alert alert-warning mt-2">
                            <p className="mb-2">
                                Você ainda não tem vínculo cadastrado na universidade, por isso não
                                há matrícula para escolher. Informe o seu vínculo abaixo para seguir
                                com o projeto.
                            </p>

                            {erroNovoVinculo && <div className="alert alert-danger py-2">{erroNovoVinculo}</div>}

                            <div className="row g-2 align-items-end">
                                <div className="col-sm-5">
                                    <label className="form-label" htmlFor="novo-vinculo-tipo">Tipo de vínculo</label>
                                    <select
                                        id="novo-vinculo-tipo"
                                        className="form-select"
                                        value={novoVinculo.tipo_vinculo}
                                        onChange={(e) => setNovoVinculo((v) => ({ ...v, tipo_vinculo: e.target.value }))}
                                    >
                                        <option value="">[Selecione]</option>
                                        {TIPOS_VINCULO.map((t) => (
                                            <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-sm-4">
                                    <label className="form-label" htmlFor="novo-vinculo-matricula">Matrícula</label>
                                    <input
                                        id="novo-vinculo-matricula"
                                        type="text"
                                        className="form-control"
                                        maxLength={50}
                                        value={novoVinculo.matricula}
                                        onChange={(e) => setNovoVinculo((v) => ({ ...v, matricula: e.target.value }))}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        disabled={salvandoVinculo || !novoVinculo.tipo_vinculo || !novoVinculo.matricula.trim()}
                                        onClick={cadastrarVinculo}
                                    >
                                        {salvandoVinculo ? 'Salvando...' : 'Cadastrar vínculo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <CampoSomenteLeitura
                    rotulo="Nome"
                    valor={form.coordenador}
                    ajuda="Vem do cadastro da matrícula escolhida."
                />
            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Unidade</legend>
                <div className="mb-3">
                    <label className="form-label" htmlFor="id-unidade">Unidade</label>
                    <select id="id-unidade"
                        className={`form-select ${errosValidacao?.unidade ? 'is-invalid' : ''}`}
                        value={form.unidade}
                        onChange={(e) => {
                            atualizarCampo("unidade", e.target.value);
                            atualizarCampo("departamento", "");
                        }}
                    >
                        <option value="">Selecione uma unidade</option>
                        {unidades.map((unidade) => (
                            <option key={unidade.id} value={unidade.id}>
                                {unidade.sigla} — {unidade.nome}
                            </option>
                        ))}
                    </select>
                    {errosValidacao?.unidade && <div className="invalid-feedback">{errosValidacao.unidade}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="id-departamento">Departamento</label>
                    <select id="id-departamento"
                        className={`form-select ${errosValidacao?.departamento ? 'is-invalid' : ''}`}
                        value={form.departamento}
                        disabled={!form.unidade || semDepartamento}
                        onChange={(e) => atualizarCampo("departamento", e.target.value)}
                    >
                        <option value="">
                            {!form.unidade
                                ? "Escolha uma unidade primeiro"
                                : semDepartamento
                                    ? "Não se aplica"
                                    : "Selecione um departamento"}
                        </option>
                        {departamentosDaUnidade.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.nome}
                            </option>
                        ))}
                    </select>
                    {semDepartamento && (
                        <div className="form-text">
                            Esta unidade não tem departamentos cadastrados, então o campo não se aplica.
                        </div>
                    )}
                    {errosValidacao?.departamento && <div className="invalid-feedback">{errosValidacao.departamento}</div>}
                </div>
            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Contato</legend>
                {form.telefones.map((telefone, i) => (
                    <CampoContato
                        key={`telefone-${i}`}
                        rotulo="Telefone"
                        tipoEntrada="tel"
                        placeholder="(00) 00000-0000"
                        valor={telefone}
                        indice={i}
                        total={form.telefones.length}
                        aoMudar={(indice, valor) => editarContato('telefones', indice, valor)}
                        aoAdicionar={() => adicionarContato('telefones')}
                        aoRemover={(indice) => removerContato('telefones', indice)}
                        erro={errosValidacao?.telefones && i === 0 ? errosValidacao.telefones : null}
                    />
                ))}
                {form.emails.map((email, i) => (
                    <CampoContato
                        key={`email-${i}`}
                        rotulo="E-mail"
                        tipoEntrada="email"
                        placeholder="nome@exemplo.com"
                        valor={email}
                        indice={i}
                        total={form.emails.length}
                        aoMudar={(indice, valor) => editarContato('emails', indice, valor)}
                        aoAdicionar={() => adicionarContato('emails')}
                        aoRemover={(indice) => removerContato('emails', indice)}
                        erro={errosValidacao?.emails && i === 0 ? errosValidacao.emails : null}
                    />
                ))}
            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Endereço</legend>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="cep">CEP</label>
                        <input
                            className={`form-control ${errosValidacao?.cep ? 'is-invalid' : ''}`}
                            id="cep"
                            placeholder= "00000-000"
                            maxLength={9}
                            value={form.cep}
                                onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                                const fmt = v.length > 5 ? `${v.slice(0,5)}-${v.slice(5)}` : v;
                                atualizarCampo('cep', fmt);
                                }}
                                onBlur={() => buscarCep(form.cep)}
                            />
                            {errosValidacao?.cep && <div className="invalid-feedback">{errosValidacao.cep}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="logradouro">Logradouro</label>
                            <input
                                className={`form-control ${errosValidacao?.logradouro ? 'is-invalid' : ''}`}
                                id="logradouro"
                                value={form.logradouro}
                                onChange={(e) => atualizarCampo('logradouro', e.target.value)}
                            />
                            {errosValidacao?.logradouro && <div className="invalid-feedback">{errosValidacao.logradouro}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="bairro">Bairro</label>
                            <input
                                className={`form-control ${errosValidacao?.bairro ? 'is-invalid' : ''}`}
                                id="bairro"
                                value={form.bairro}
                                onChange={(e) => atualizarCampo('bairro', e.target.value)}
                            />
                            {errosValidacao?.bairro && <div className="invalid-feedback">{errosValidacao.bairro}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="municipio">Município</label>
                            <select
                                className={`form-select ${errosValidacao?.municipio ? 'is-invalid' : ''}`}
                                id="municipio"
                                value={form.municipio}
                                onChange={(e) => atualizarCampo("municipio", e.target.value)}
                            >
                                <option value="">Selecione um município</option>
                                {MUNICIPIOS_RJ.map((m) => (
                                    <option key={m.codigo} value={m.codigo}>
                                        {m.nome}
                                    </option>
                                ))}
                            </select>
                            {errosValidacao?.municipio && <div className="invalid-feedback">{errosValidacao.municipio}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="numero">Numero</label>
                            <input
                                className={`form-control ${errosValidacao?.numero ? 'is-invalid' : ''}`}
                                id="numero"
                                value={form.numero}
                                onChange={(e) => atualizarCampo('numero', e.target.value)}
                            />
                            {errosValidacao?.numero && <div className="invalid-feedback">{errosValidacao.numero}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="complemento">Complemento</label>
                                <input
                                className="form-control"
                                id="complemento"
                                value={form.complemento}
                                onChange={(e) => atualizarCampo('complemento', e.target.value)}
                            />
                        </div>
                    </fieldset>
        </fieldset>
    );
}

export default Identificacao;
