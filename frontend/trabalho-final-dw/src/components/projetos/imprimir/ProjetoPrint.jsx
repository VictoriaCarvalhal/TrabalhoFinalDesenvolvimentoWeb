import pr3Logo from '../../../assets/pr3_logo.png';

function simNao(valor) {
    if (valor === true) return 'Sim';
    if (valor === false) return 'Não';
    return '—';
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

function ProjetoPrint({ dados }) {
    const projeto = dados?.projeto ?? {};
    const endereco = dados?.endereco ?? {};
    const contatos = dados?.contatos ?? [];
    const caracterizacao = dados?.caracterizacao ?? {};
    const descricao = dados?.descricao ?? {};
    const palavrasChave = descricao.palavras_chave ?? [];

    const enderecoLinha = [
        endereco.logradouro && endereco.numero
            ? `${endereco.logradouro}, ${endereco.numero}`
            : (endereco.logradouro ?? endereco.numero ?? null),
        endereco.complemento ?? null,
        endereco.bairro ?? null,
        endereco.municipio ?? null,
        endereco.cep ? `CEP ${endereco.cep}` : null,
    ].filter(Boolean).join(' — ') || '—';

    return (
        <div className="projeto-print">
            {/* Capa institucional */}
            <header className="text-center mb-4">
                <img src={pr3Logo} alt="PR-3 UERJ" style={{ maxHeight: '90px' }} />
                <p className="mt-2 mb-0 fw-bold">Universidade do Estado do Rio de Janeiro</p>
                <p className="text-muted">Pró-Reitoria de Extensão e Cultura</p>
                <hr />
                <h2 className="h4 mt-3">{projeto.titulo ?? 'Sem título'}</h2>
                <p className="mb-1">
                    <span className="badge bg-primary me-2">
                        {projeto.ano ?? '—'}/{projeto.numero ?? '—'}
                    </span>
                    <span className="badge bg-secondary">{projeto.situacao ?? '—'}</span>
                </p>
                <p className="mb-0"><strong>Coordenação:</strong> {projeto.coordenador ?? '—'}</p>
                <p className="mb-0"><strong>Unidade proponente:</strong> {projeto.unidade_proponente ?? '—'}</p>
                <p className="text-muted">
                    <strong>Departamento:</strong> {projeto.departamento_proponente ?? '—'}
                </p>
                <p className="text-muted small mb-0">
                    Criado em {projeto.criado_em ?? '—'} · Atualizado em {projeto.atualizado_em ?? '—'}
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
                            <li key={indice}>
                                <strong>{contato?.tipo ?? 'Contato'}:</strong> {contato?.valor ?? '—'}
                                {contato?.ddd ? ` (DDD ${contato.ddd}` : ''}
                                {contato?.ramal ? `, ramal ${contato.ramal}` : ''}
                                {contato?.ddd ? ')' : ''}
                                {contato?.tipo_telefone ? ` — ${contato.tipo_telefone}` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </Secao>

            {/* Caracterização */}
            <Secao titulo="Caracterização">
                <Campo rotulo="Situação acadêmica" valor={caracterizacao.situacao_academica} />
                <Campo rotulo="Vinculado a programa de extensão" valor={simNao(caracterizacao.vinculado_programa_extensao)} />
                <Campo rotulo="Curricularizado" valor={simNao(caracterizacao.curricularizado)} />
                <Campo rotulo="Natureza" valor={caracterizacao.natureza} />
                <Campo rotulo="Abrangência" valor={caracterizacao.abrangencia} />
                <Campo rotulo="Público-alvo" valor={caracterizacao.publico_alvo} />
                <Campo rotulo="Grande área CNPq" valor={caracterizacao.grande_area_cnpq} />
                <Campo rotulo="Área temática principal" valor={caracterizacao.area_tematica_principal} />
                <Campo rotulo="Área temática secundária" valor={caracterizacao.area_tematica_secundaria} />
                <Campo rotulo="Linha de extensão" valor={caracterizacao.linha_extensao} />
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
        </div>
    );
}

export default ProjetoPrint;
