import pr3Logo from '../../../assets/pr3_logo.png';

// Documento de impressão do projeto. Componente puro: recebe o DTO e
// renderiza. O CSS de impressão vive em imprimir.css.
// O DTO segue os serializers do backend: choices como código + <campo>_display
// e FKs como id + displays desnormalizados.

function simNao(valor) {
    if (valor === true) return 'Sim';
    if (valor === false) return 'Não';
    return '—';
}

// Labels para choices que o serializer retorna só como código.
const ABRANGENCIA_LABELS = {
    LOCAL: 'Local',
    REGIONAL: 'Regional',
    NACIONAL: 'Nacional',
    INTERNACIONAL: 'Internacional',
};

const SITUACAO_ACADEMICA_LABELS = {
    NOVO: 'Novo',
    RENOVACAO: 'Renovação',
    REESTRUTURACAO: 'Reestruturação',
};

function rotuloCodigo(valor, mapa) {
    if (valor == null || valor === '') return '—';
    return mapa[valor] ?? valor;
}

function formatarData(valor) {
    if (!valor) return '—';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleDateString('pt-BR');
}

function municipioTexto(item, legado) {
    if (item?.municipio_nome) {
        return item.municipio_uf ? `${item.municipio_nome}/${item.municipio_uf}` : item.municipio_nome;
    }
    return legado ?? item?.municipio ?? '—';
}

function Secao({ titulo, children }) {
    return (
        <section className="mb-4">
            <h3 className="h5 border-bottom pb-1">{titulo}</h3>
            {children}
        </section>
    );
}

function Campo({ rotulo, valor }) {
    return (
        <p className="mb-2">
            <strong>{rotulo}:</strong> {valor ?? '—'}
        </p>
    );
}

function Tabela({ colunas, linhas, renderLinha }) {
    if (!linhas || linhas.length === 0) {
        return <p className="mb-0">—</p>;
    }
    return (
        <table className="table table-sm table-bordered mb-0">
            <thead>
                <tr>
                    {colunas.map((coluna) => (
                        <th key={coluna} scope="col">{coluna}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {linhas.map((linha, indice) => renderLinha(linha, indice))}
            </tbody>
        </table>
    );
}

function ProjetoPrint({ dados }) {
    const projeto = dados?.projeto ?? {};
    const endereco = dados?.endereco ?? {};
    const contatos = dados?.contatos ?? [];
    const caracterizacao = dados?.caracterizacao ?? {};
    const descricao = dados?.descricao ?? {};
    const palavrasChave = descricao.palavras_chave ?? [];
    const planosTrabalho = dados?.planos_trabalho ?? [];
    const demandasBolsa = dados?.demandas_bolsa ?? [];
    const unidadesEnvolvidas = dados?.unidades_envolvidas ?? [];
    const locaisRealizacao = dados?.locais_realizacao ?? [];
    const parceriasInternas = dados?.parcerias_internas ?? [];
    const parceriasExternas = dados?.parcerias_externas ?? [];
    const membrosEquipe = dados?.membros_equipe ?? dados?.equipe ?? [];

    const coordenadorNome = projeto.coordenador_nome ?? projeto.coordenador ?? '—';
    const unidadeProponenteTexto = projeto.unidade_nome
        ? (projeto.unidade_sigla ? `${projeto.unidade_sigla} — ${projeto.unidade_nome}` : projeto.unidade_nome)
        : (projeto.unidade_sigla ?? projeto.unidade_proponente ?? '—');
    const departamentoProponenteTexto = projeto.departamento_nome ?? projeto.departamento_proponente ?? '—';
    const situacaoTexto = projeto.situacao_display ?? projeto.situacao ?? '—';

    const enderecoLinha = [
        endereco.logradouro && endereco.numero
            ? `${endereco.logradouro}, ${endereco.numero}`
            : (endereco.logradouro ?? endereco.numero ?? null),
        endereco.complemento ?? null,
        endereco.bairro ?? null,
        municipioTexto(endereco, typeof endereco.municipio === 'string' ? endereco.municipio : null) === '—'
            ? null
            : municipioTexto(endereco, typeof endereco.municipio === 'string' ? endereco.municipio : null),
        endereco.cep ? `CEP ${endereco.cep}` : null,
    ].filter(Boolean).join(' — ') || '—';

    const tituloCurto = (projeto.titulo ?? 'Sem título').length > 80
        ? `${(projeto.titulo ?? '').slice(0, 80)}…`
        : (projeto.titulo ?? 'Sem título');

    return (
        <div className="projeto-print">
            <div className="print-cabecalho" aria-hidden="true">
                UERJ · PR-3 — {tituloCurto} — {projeto.ano ?? '—'}/{projeto.numero ?? '—'}
            </div>
            {/* Capa institucional */}
            <header className="capa mb-3">
                <img src={pr3Logo} alt="UERJ · PR-3" className="capa-logo" />
                <p className="capa-inst">Universidade do Estado do Rio de Janeiro · Pró-Reitoria de Extensão e Cultura</p>
                <hr />
                <h2 className="h4 mt-3">{projeto.titulo ?? 'Sem título'}</h2>
                <p className="mb-1">
                    <span className="badge bg-primary me-2">
                        {projeto.ano ?? '—'}/{projeto.numero ?? '—'}
                    </span>
                    <span className="badge bg-secondary">{situacaoTexto}</span>
                </p>
                <p className="mb-0"><strong>Coordenação:</strong> {coordenadorNome}</p>
                <p className="mb-0"><strong>Unidade proponente:</strong> {unidadeProponenteTexto}</p>
                <p className="text-muted">
                    <strong>Departamento:</strong> {departamentoProponenteTexto}
                </p>
                <p className="text-muted small mb-0">
                    Criado em {formatarData(projeto.created_at ?? projeto.criado_em)} · Atualizado em {formatarData(projeto.updated_at ?? projeto.atualizado_em)}
                </p>
            </header>

            {/* Identificação — endereço */}
            <Secao titulo="Endereço">
                <p className="mb-0">{enderecoLinha}</p>
            </Secao>

            {/* Identificação — contatos */}
            <Secao titulo="Contatos">
                {contatos.length === 0 ? (
                    <p className="mb-0">—</p>
                ) : (
                    <ul className="list-unstyled mb-0">
                        {contatos.map((contato, indice) => (
                            <li key={contato?.id ?? indice}>
                                <strong>{contato?.tipo_contato_display ?? contato?.tipo ?? 'Contato'}:</strong> {contato?.valor ?? '—'}
                                {contato?.ddd ? ` (DDD ${contato.ddd}` : ''}
                                {contato?.ramal ? `, ramal ${contato.ramal}` : ''}
                                {contato?.ddd ? ')' : ''}
                                {contato?.tipo_telefone_display ?? contato?.tipo_telefone ? ` — ${contato?.tipo_telefone_display ?? contato?.tipo_telefone}` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </Secao>

            {/* Caracterização */}
            <Secao titulo="Caracterização">
                <Campo rotulo="Situação acadêmica" valor={rotuloCodigo(caracterizacao.situacao_academica, SITUACAO_ACADEMICA_LABELS)} />
                <Campo rotulo="Vinculado a programa de extensão" valor={simNao(caracterizacao.vinculado_programa_extensao)} />
                <Campo rotulo="Curricularizado" valor={simNao(caracterizacao.curricularizado)} />
                <Campo rotulo="Natureza" valor={caracterizacao.natureza_display ?? caracterizacao.natureza} />
                <Campo rotulo="Abrangência" valor={rotuloCodigo(caracterizacao.abrangencia, ABRANGENCIA_LABELS)} />
                <Campo rotulo="Público-alvo" valor={caracterizacao.publico_alvo} />
                <Campo rotulo="Grande área CNPq" valor={caracterizacao.grande_area_display ?? caracterizacao.grande_area_cnpq} />
                <Campo rotulo="Área temática principal" valor={caracterizacao.area_principal_display ?? caracterizacao.area_tematica_principal} />
                <Campo rotulo="Área temática secundária" valor={caracterizacao.area_secundaria_display ?? caracterizacao.area_tematica_secundaria} />
                <Campo rotulo="Linha de extensão" valor={caracterizacao.linha_extensao_display ?? caracterizacao.linha_extensao} />
            </Secao>

            {/* Descrição */}
            <Secao titulo="Descrição">
                <Campo rotulo="Resumo" valor={descricao.resumo} />
                <p className="mb-2">
                    <strong>Palavras-chave:</strong>{' '}
                    {palavrasChave.length > 0 ? palavrasChave.join('; ') : '—'}
                </p>
                <Campo rotulo="Introdução" valor={descricao.introducao} />
                <Campo rotulo="Justificativa" valor={descricao.justificativa} />
                <Campo rotulo="Objetivo geral" valor={descricao.objetivo_geral} />
                <Campo rotulo="Objetivos específicos" valor={descricao.objetivos_especificos} />
                <Campo rotulo="Metodologia e avaliação" valor={descricao.metodologia_avaliacao} />
                <Campo rotulo="Relação com o ensino" valor={simNao(descricao.relacao_ensino)} />
                <Campo rotulo="Relação com a pesquisa" valor={simNao(descricao.relacao_pesquisa)} />
                <Campo rotulo="Interação dialógica" valor={descricao.interacao_dialogica} />
                <Campo rotulo="Interdisciplinaridade" valor={descricao.interdisciplinaridade} />
                <Campo rotulo="Impacto na formação" valor={descricao.impacto_formacao} />
                <Campo rotulo="Indissociabilidade ensino-pesquisa-extensão" valor={descricao.indissociabilidade} />
                <Campo rotulo="Impacto social" valor={descricao.impacto_social} />
                <Campo rotulo="Referências bibliográficas" valor={descricao.referencias_bibliograficas} />
            </Secao>

            {/* Planos de trabalho */}
            <Secao titulo="Planos de trabalho">
                <Tabela
                    colunas={['Ano', 'Resultados esperados', 'Cronograma de atividades']}
                    linhas={planosTrabalho}
                    renderLinha={(plano, indice) => (
                        <tr key={plano?.id ?? indice}>
                            <td>{plano?.ano ?? '—'}</td>
                            <td>{plano?.resultados_esperados ?? '—'}</td>
                            <td>{plano?.cronograma_atividades ?? '—'}</td>
                        </tr>
                    )}
                />
            </Secao>

            {/* Demandas de bolsa */}
            <Secao titulo="Demandas de bolsa">
                <Tabela
                    colunas={['Tipo', 'Quantidade', 'Justificativa']}
                    linhas={demandasBolsa}
                    renderLinha={(demanda, indice) => (
                        <tr key={demanda?.id ?? indice}>
                            <td>{demanda?.tipo_bolsa_display ?? demanda?.tipo_bolsa ?? demanda?.tipo ?? '—'}</td>
                            <td>{demanda?.quantidade ?? '—'}</td>
                            <td>{demanda?.justificativa ?? '—'}</td>
                        </tr>
                    )}
                />
            </Secao>

            {/* Unidades envolvidas */}
            <Secao titulo="Unidades envolvidas">
                <Tabela
                    colunas={['Sigla', 'Nome', 'Participação']}
                    linhas={unidadesEnvolvidas}
                    renderLinha={(unidade, indice) => (
                        <tr key={unidade?.id ?? indice}>
                            <td>{unidade?.unidade_sigla ?? unidade?.sigla ?? '—'}</td>
                            <td>{unidade?.unidade_nome ?? unidade?.nome ?? '—'}</td>
                            <td>{unidade?.tipo_participacao_display ?? unidade?.tipo_participacao ?? unidade?.participacao ?? '—'}</td>
                        </tr>
                    )}
                />
            </Secao>

            {/* Locais de realização */}
            <Secao titulo="Locais de realização">
                {locaisRealizacao.length === 0 ? (
                    <p className="mb-0">—</p>
                ) : (
                    locaisRealizacao.map((local, indice) => (
                        <div key={local?.id ?? indice} className="mb-2">
                            <p className="fw-bold mb-0">{local?.nome_local ?? local?.nome ?? '—'}</p>
                            <p className="mb-0 text-muted">
                                {municipioTexto(local, typeof local?.municipio === 'string' ? local.municipio : null)}
                                {local?.endereco_completo ? ` — ${local.endereco_completo}` : ''}
                            </p>
                        </div>
                    ))
                )}
            </Secao>

            {/* Parcerias internas */}
            <Secao titulo="Parcerias internas">
                {parceriasInternas.length === 0 ? (
                    <p className="mb-0">—</p>
                ) : (
                    parceriasInternas.map((parceria, indice) => (
                        <div key={parceria?.id ?? indice} className="mb-2">
                            <p className="fw-bold mb-0">
                                {parceria?.unidade_sigla ?? parceria?.unidade ?? '—'}
                                {(parceria?.departamento_nome ?? parceria?.departamento) ? ` — ${parceria?.departamento_nome ?? parceria?.departamento}` : ''}
                            </p>
                            <p className="mb-0">
                                {parceria?.nome_instituicao ?? parceria?.unidade_nome ?? '—'}
                                {parceria?.sigla_instituicao ? ` (${parceria.sigla_instituicao})` : ''}
                            </p>
                            <p className="mb-0 text-muted">{parceria?.participacao ?? '—'}</p>
                        </div>
                    ))
                )}
            </Secao>

            {/* Parcerias externas */}
            <Secao titulo="Parcerias externas">
                {parceriasExternas.length === 0 ? (
                    <p className="mb-0">—</p>
                ) : (
                    parceriasExternas.map((parceria, indice) => (
                        <div key={parceria?.id ?? indice} className="mb-2">
                            <p className="fw-bold mb-0">
                                {parceria?.nome_instituicao ?? '—'}
                                {parceria?.sigla_instituicao ? ` (${parceria.sigla_instituicao})` : ''}
                                {(parceria?.tipo_instituicao_display ?? parceria?.tipo_instituicao) ? ` — ${parceria?.tipo_instituicao_display ?? parceria?.tipo_instituicao}` : ''}
                            </p>
                            <p className="mb-0 text-muted">{parceria?.participacao ?? '—'}</p>
                        </div>
                    ))
                )}
            </Secao>

            {/* Equipe */}
            <Secao titulo="Equipe">
                <Tabela
                    colunas={['Nome', 'Função', 'Carga horária semanal (h)']}
                    linhas={membrosEquipe}
                    renderLinha={(membro, indice) => (
                        <tr key={membro?.id ?? indice}>
                            <td>{membro?.nome ?? '—'}</td>
                            <td>{membro?.funcao_display ?? membro?.funcao ?? '—'}</td>
                            <td>{membro?.carga_horaria_semanal ?? '—'}</td>
                        </tr>
                    )}
                />
            </Secao>
        </div>
    );
}

export default ProjetoPrint;
