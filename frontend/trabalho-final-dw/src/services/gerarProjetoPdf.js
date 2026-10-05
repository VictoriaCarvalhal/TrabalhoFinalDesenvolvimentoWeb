import api from './api';
import { useAuthStore } from '../stores/authStore';
import {
    ABRANGENCIA_LABELS,
    SITUACAO_ACADEMICA_LABELS,
    formatarData,
    municipioTexto,
    rotuloCodigo,
    simNao,
} from '../components/projetos/imprimir/rotulosImpressao.js';
import pr3LogoUrl from '../assets/pr3_logo.png';

function formatarGeradoEm(data = new Date()) {
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function nomeArquivoPdf(dados, fallbackId) {
    const ano = dados?.projeto?.ano ?? '';
    const numero = dados?.projeto?.numero ?? '';
    if (ano !== '' && numero !== '') {
        return `projeto-${ano}-${numero}.pdf`;
    }
    return `projeto-${fallbackId ?? 'download'}.pdf`;
}

async function logoDataUrl() {
    try {
        const resposta = await fetch(pr3LogoUrl);
        if (!resposta.ok) return null;
        const blob = await resposta.blob();
        return await new Promise((resolve) => {
            const leitor = new FileReader();
            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = () => resolve(null);
            leitor.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function tituloCurto(projeto) {
    const titulo = projeto.titulo ?? 'Sem título';
    return titulo.length > 80 ? `${titulo.slice(0, 80)}…` : titulo;
}

function secao(titulo, conteudo) {
    return [
        { text: titulo, style: 'h3', margin: [0, 10, 0, 2] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 527, y2: 0, lineWidth: 1 }] },
        { text: '', margin: [0, 0, 0, 4] },
        ...conteudo,
    ];
}

function campo(rotulo, valor) {
    return {
        text: [{ text: `${rotulo}: `, bold: true }, valor ?? '—'],
        margin: [0, 0, 0, 4],
    };
}

function tabela(colunas, linhas) {
    if (!linhas || linhas.length === 0) {
        return { text: '—', margin: [0, 0, 0, 4] };
    }
    return {
        table: { headerRows: 1, widths: colunas.widths, body: [colunas.titulos, ...linhas] },
        layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
        },
        style: 'tabela',
        margin: [0, 0, 0, 4],
    };
}

function cabecaTabela(titulos) {
    return titulos.map((t) => ({ text: t, bold: true }));
}

function montarConteudo(dados, geradoEm, geradoPor, logo) {
    const projeto = dados?.projeto ?? {};
    const endereco = dados?.endereco ?? {};
    const contatos = dados?.contatos ?? [];
    const caracterizacao = dados?.caracterizacao ?? {};
    const descricao = dados?.descricao ?? {};
    const palavrasChave = (dados?.palavras_chave ?? []).map((p) => p?.palavra).filter(Boolean);
    const planosTrabalho = dados?.planos_trabalho ?? [];
    const demandasBolsa = dados?.demandas_bolsa ?? [];
    const unidadesEnvolvidas = dados?.unidades_envolvidas ?? [];
    const locaisRealizacao = dados?.locais_realizacao ?? [];
    const parceriasInternas = dados?.parcerias_internas ?? [];
    const parceriasExternas = dados?.parcerias_externas ?? [];
    const membrosEquipe = dados?.membros_equipe ?? dados?.equipe ?? [];

    const coordenadorNome = projeto.coordenador_nome ?? projeto.coordenador ?? '—';
    const unidadeTexto = projeto.unidade_nome
        ? (projeto.unidade_sigla ? `${projeto.unidade_sigla} — ${projeto.unidade_nome}` : projeto.unidade_nome)
        : (projeto.unidade_sigla ?? projeto.unidade_proponente ?? '—');
    const departamentoTexto = projeto.departamento_nome ?? projeto.departamento_proponente ?? '—';
    const situacaoTexto = projeto.situacao_display ?? projeto.situacao ?? '—';

    const enderecoLinha = [
        endereco.logradouro && endereco.numero
            ? `${endereco.logradouro}, ${endereco.numero}`
            : (endereco.logradouro ?? endereco.numero ?? null),
        endereco.complemento ?? null,
        endereco.bairro ?? null,
        (() => {
            const m = municipioTexto(endereco, typeof endereco.municipio === 'string' ? endereco.municipio : null);
            return m === '—' ? null : m;
        })(),
        endereco.cep ? `CEP ${endereco.cep}` : null,
    ].filter(Boolean).join(' — ') || '—';

    const contatoTexto = (contato) => {
        let texto = `${contato?.tipo_contato_display ?? contato?.tipo ?? 'Contato'}: ${contato?.valor ?? '—'}`;
        if (contato?.ddd) {
            texto += ` (DDD ${contato.ddd}${contato?.ramal ? `, ramal ${contato.ramal}` : ''})`;
        }
        const tipoTel = contato?.tipo_telefone_display ?? contato?.tipo_telefone;
        if (tipoTel) texto += ` — ${tipoTel}`;
        return texto;
    };

    const conteudo = [];

    if (logo) {
        conteudo.push({ image: logo, fit: [180, 68], alignment: 'center', margin: [0, 0, 0, 2] });
    }
    conteudo.push(
        { text: 'Universidade do Estado do Rio de Janeiro · Pró-Reitoria de Extensão e Cultura', bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
        { text: projeto.titulo ?? 'Sem título', style: 'titulo', margin: [0, 0, 0, 4] },
        {
            columns: [
                { width: 'auto', table: { body: [[{ text: `${projeto.ano ?? '—'}/${projeto.numero ?? '—'}`, style: 'pill' }]] }, layout: 'pill' },
                { width: 'auto', table: { body: [[{ text: situacaoTexto, style: 'pill' }]] }, layout: 'pill' },
            ],
            columnGap: 6,
            margin: [0, 0, 0, 4],
        },
        campo('Coordenação', coordenadorNome),
        campo('Unidade proponente', unidadeTexto),
        { text: [{ text: 'Departamento: ', bold: true }, departamentoTexto], style: 'muted', margin: [0, 0, 0, 2] },
        {
            text: `Criado em ${formatarData(projeto.created_at ?? projeto.criado_em)} · Atualizado em ${formatarData(projeto.updated_at ?? projeto.atualizado_em)}`,
            style: 'mutedSmall',
            margin: [0, 0, 0, 2],
        },
    );

    conteudo.push(...secao('Endereço', [{ text: enderecoLinha, margin: [0, 0, 0, 4] }]));

    conteudo.push(...secao('Contatos', [
        contatos.length === 0
            ? { text: '—', margin: [0, 0, 0, 4] }
            : { ul: contatos.map(contatoTexto), margin: [0, 0, 0, 4] },
    ]));

    conteudo.push(...secao('Caracterização', [
        campo('Situação acadêmica', rotuloCodigo(caracterizacao.situacao_academica, SITUACAO_ACADEMICA_LABELS)),
        campo('Vinculado a programa de extensão', simNao(caracterizacao.vinculado_programa_extensao)),
        campo('Curricularizado', simNao(caracterizacao.curricularizado)),
        campo('Natureza', caracterizacao.natureza_display ?? caracterizacao.natureza),
        campo('Abrangência', rotuloCodigo(caracterizacao.abrangencia, ABRANGENCIA_LABELS)),
        campo('Público-alvo', caracterizacao.publico_alvo),
        campo('Grande área CNPq', caracterizacao.grande_area_display ?? caracterizacao.grande_area_cnpq),
        campo('Área temática principal', caracterizacao.area_principal_display ?? caracterizacao.area_tematica_principal),
        campo('Área temática secundária', caracterizacao.area_secundaria_display ?? caracterizacao.area_tematica_secundaria),
        campo('Linha de extensão', caracterizacao.linha_extensao_display ?? caracterizacao.linha_extensao),
    ]));

    conteudo.push(...secao('Descrição', [
        campo('Resumo', descricao.resumo),
        { text: [{ text: 'Palavras-chave: ', bold: true }, palavrasChave.length > 0 ? palavrasChave.join('; ') : '—'], margin: [0, 0, 0, 4] },
        campo('Introdução', descricao.introducao),
        campo('Justificativa', descricao.justificativa),
        campo('Objetivo geral', descricao.objetivo_geral),
        campo('Objetivos específicos', descricao.objetivos_especificos),
        campo('Metodologia e avaliação', descricao.metodologia_avaliacao),
        campo('Relação com o ensino', simNao(descricao.relacao_ensino)),
        campo('Relação com a pesquisa', simNao(descricao.relacao_pesquisa)),
        campo('Interação dialógica', descricao.interacao_dialogica),
        campo('Interdisciplinaridade', descricao.interdisciplinaridade),
        campo('Impacto na formação', descricao.impacto_formacao),
        campo('Indissociabilidade ensino-pesquisa-extensão', descricao.indissociabilidade),
        campo('Impacto social', descricao.impacto_social),
        campo('Referências bibliográficas', descricao.referencias_bibliograficas),
    ]));

    conteudo.push(...secao('Planos de trabalho', [
        tabela(
            { titulos: cabecaTabela(['Ano', 'Resultados esperados', 'Cronograma de atividades']), widths: [35, '*', '*'] },
            planosTrabalho.map((plano) => [plano?.ano ?? '—', plano?.resultados_esperados ?? '—', plano?.cronograma_atividades ?? '—']),
        ),
    ]));

    conteudo.push(...secao('Demandas de bolsa', [
        tabela(
            { titulos: cabecaTabela(['Tipo', 'Quantidade', 'Justificativa']), widths: ['*', 60, '*'] },
            demandasBolsa.map((demanda) => [
                demanda?.tipo_bolsa_display ?? demanda?.tipo_bolsa ?? demanda?.tipo ?? '—',
                demanda?.quantidade ?? '—',
                demanda?.justificativa ?? '—',
            ]),
        ),
    ]));

    conteudo.push(...secao('Unidades envolvidas', [
        tabela(
            { titulos: cabecaTabela(['Sigla', 'Nome', 'Participação']), widths: [60, '*', '*'] },
            unidadesEnvolvidas.map((unidade) => [
                unidade?.unidade_sigla ?? unidade?.sigla ?? '—',
                unidade?.unidade_nome ?? unidade?.nome ?? '—',
                unidade?.tipo_participacao_display ?? unidade?.tipo_participacao ?? unidade?.participacao ?? '—',
            ]),
        ),
    ]));

    conteudo.push(...secao('Locais de realização', [
        locaisRealizacao.length === 0
            ? { text: '—', margin: [0, 0, 0, 4] }
            : locaisRealizacao.map((local) => ({
                stack: [
                    { text: local?.nome_local ?? local?.nome ?? '—', bold: true, margin: [0, 0, 0, 1] },
                    {
                        text: `${municipioTexto(local, typeof local?.municipio === 'string' ? local.municipio : null)}${local?.endereco_completo ? ` — ${local.endereco_completo}` : ''}`,
                        style: 'muted',
                        margin: [0, 0, 0, 6],
                    },
                ],
            })),
    ]));

    const parceriaInternaTexto = (parceria) => ({
        stack: [
            {
                text: `${parceria?.unidade_sigla ?? parceria?.unidade ?? '—'}${(parceria?.departamento_nome ?? parceria?.departamento) ? ` — ${parceria?.departamento_nome ?? parceria?.departamento}` : ''}`,
                bold: true,
                margin: [0, 0, 0, 1],
            },
            { text: `${parceria?.nome_instituicao ?? parceria?.unidade_nome ?? '—'}${parceria?.sigla_instituicao ? ` (${parceria.sigla_instituicao})` : ''}`, margin: [0, 0, 0, 1] },
            { text: parceria?.participacao ?? '—', style: 'muted', margin: [0, 0, 0, 6] },
        ],
    });

    conteudo.push(...secao('Parcerias internas', [
        parceriasInternas.length === 0
            ? { text: '—', margin: [0, 0, 0, 4] }
            : parceriasInternas.map(parceriaInternaTexto),
    ]));

    conteudo.push(...secao('Parcerias externas', [
        parceriasExternas.length === 0
            ? { text: '—', margin: [0, 0, 0, 4] }
            : parceriasExternas.map((parceria) => ({
                stack: [
                    {
                        text: `${parceria?.nome_instituicao ?? '—'}${parceria?.sigla_instituicao ? ` (${parceria.sigla_instituicao})` : ''}${(parceria?.tipo_instituicao_display ?? parceria?.tipo_instituicao) ? ` — ${parceria?.tipo_instituicao_display ?? parceria?.tipo_instituicao}` : ''}`,
                        bold: true,
                        margin: [0, 0, 0, 1],
                    },
                    { text: parceria?.participacao ?? '—', style: 'muted', margin: [0, 0, 0, 6] },
                ],
            })),
    ]));

    conteudo.push(...secao('Equipe', [
        tabela(
            { titulos: cabecaTabela(['Nome', 'Função', 'Carga horária semanal (h)']), widths: ['*', '*', 90] },
            membrosEquipe.map((membro) => [
                membro?.nome ?? '—',
                membro?.funcao_display ?? membro?.funcao ?? '—',
                membro?.carga_horaria_semanal ?? '—',
            ]),
        ),
    ]));

    const cabecalhoCorrido = `UERJ · PR-3 — ${tituloCurto(projeto)} — ${projeto.ano ?? '—'}/${projeto.numero ?? '—'}`;

    return {
        pageSize: 'A4',
        pageMargins: [34, 72, 34, 64],
        header: () => ({
            text: cabecalhoCorrido,
            fontSize: 8,
            margin: [34, 24, 34, 0],
        }),
        footer: (paginaAtual, totalPaginas) => ({
            columns: [
                { text: `Gerado em ${geradoEm} por ${geradoPor}`, fontSize: 8 },
                { text: `Página ${paginaAtual} de ${totalPaginas}`, fontSize: 8, alignment: 'right' },
            ],
            margin: [34, 0, 34, 20],
        }),
        content: conteudo,
        defaultStyle: { font: 'Helvetica', fontSize: 10, lineHeight: 1.4 },
        styles: {
            titulo: { fontSize: 15, bold: true },
            h3: { fontSize: 12, bold: true },
            tabela: { fontSize: 9 },
            pill: { fontSize: 9 },
            muted: { color: '#333333' },
            mutedSmall: { fontSize: 9, color: '#555555' },
        },
    };
}

async function montarPdf(dados, { geradoEm, geradoPor } = {}) {
    const [{ default: pdfMake }, helveticaMod] = await Promise.all([
        import('pdfmake/build/pdfmake.js'),
        import('pdfmake/build/standard-fonts/Helvetica.js'),
    ]);
    const container = helveticaMod?.fonts ? helveticaMod : helveticaMod?.default;
    if (container) {
        pdfMake.addFontContainer(container);
    }

    const textoGeradoEm = geradoEm ?? formatarGeradoEm(new Date());
    let textoGeradoPor = geradoPor ?? useAuthStore.getState().nomeUsuario ?? null;
    if (!textoGeradoPor) {
        try {
            const respostaMe = await api.get('/auth/me/');
            textoGeradoPor = respostaMe.data?.nome_completo ?? respostaMe.data?.nome ?? null;
        } catch {
        }
    }
    textoGeradoPor ??= '—';

    const logo = await logoDataUrl();
    const docDefinition = montarConteudo(dados, textoGeradoEm, textoGeradoPor, logo);

    return { pdfMake, docDefinition };
}

export async function gerarPdfPorDados(dados, { geradoEm, geradoPor, projetoId } = {}) {
    const { pdfMake, docDefinition } = await montarPdf(dados, { geradoEm, geradoPor });
    pdfMake.createPdf(docDefinition).download(nomeArquivoPdf(dados, projetoId));
}

export async function gerarPdfBase64(dados, { geradoEm, geradoPor } = {}) {
    const { pdfMake, docDefinition } = await montarPdf(dados, { geradoEm, geradoPor });
    return pdfMake.createPdf(docDefinition).getBase64();
}

export async function gerarPdfPorId(projetoId) {
    const resposta = await api.get(`/projetos/${projetoId}/impressao/`);
    await gerarPdfPorDados(resposta.data, { projetoId });
}
