/*UPDATE projetos_projeto
SET excluido = true
WHERE titulo != 'Matemática para Todos: extensão e cidadania na Região Metropolitana do Rio de Janeiro';*/ 

SELECT
  p.id, p.ano, p.numero, p.titulo, p.situacao,
  p.coordenador_id, pes.nome_completo AS coordenador_nome,
  pes.cpf AS coordenador_cpf, vinc.tipo_vinculo, vinc.matricula,
  ua_prop.sigla AS unidade_sigla, ua_prop.nome AS unidade_nome,
  dep_prop.nome AS departamento_nome,
  pe.logradouro, pe.numero AS end_numero, pe.complemento,
  pe.bairro, pe.cep, mun_end.nome AS end_municipio, mun_end.uf AS end_uf,
  pc.situacao_academica, pc.vinculado_programa_extensao,
  pc.curricularizado, pc.abrangencia, pc.publico_alvo,
  pc.natureza_id, pc.grande_area_cnpq_id,
  pc.area_tematica_principal_id, pc.area_tematica_secundaria_id,
  pc.linha_extensao_id,
  pd.resumo, pd.introducao, pd.justificativa,
  pd.objetivo_geral, pd.objetivos_especificos,
  pd.metodologia_avaliacao, pd.relacao_ensino, pd.relacao_pesquisa,
  pd.interacao_dialogica, pd.interdisciplinaridade,
  pd.impacto_formacao, pd.indissociabilidade,
  pd.impacto_social, pd.referencias_bibliograficas,
  p.created_at, p.updated_at
FROM projetos_projeto p
LEFT JOIN core_vinculoinstitucional vinc ON vinc.id = p.coordenador_id
LEFT JOIN core_pessoaglobal pes ON pes.id = vinc.pessoa_id
LEFT JOIN core_unidadeacademica ua_prop ON ua_prop.id = p.unidade_proponente_id
LEFT JOIN core_departamento dep_prop ON dep_prop.id = p.departamento_proponente_id
LEFT JOIN projetos_projetoendereco pe ON pe.projeto_id = p.id
LEFT JOIN core_municipioibge mun_end ON mun_end.codigo_ibge = pe.municipio_id
LEFT JOIN projetos_projetocaracterizacao pc ON pc.projeto_id = p.id
LEFT JOIN projetos_projetodescricao pd ON pd.projeto_id = p.id
WHERE p.excluido = false
ORDER BY p.ano DESC, p.titulo;

-- ============================================================
-- DADOS DE SUPORTE (execute primeiro se ainda não existirem)
-- ============================================================
-- Unidades Acadêmicas
INSERT INTO core_unidadeacademica (id, sigla, nome, ativo) VALUES
  (1, 'CCT', 'Centro de Ciências e Tecnologia', true),
  (2, 'CCS', 'Centro de Ciências da Saúde', true),
  (3, 'CCH', 'Centro de Ciências Humanas', true),
  (4, 'CCAE', 'Centro de Ciências Agrárias e Engenharias', true)
ON CONFLICT (sigla) DO NOTHING;
-- Departamentos
INSERT INTO core_departamento (id, unidade_id, nome, ativo) VALUES
  (1, 1, 'Departamento de Computação', true),
  (2, 2, 'Departamento de Enfermagem', true),
  (3, 3, 'Departamento de Educação', true),
  (4, 4, 'Departamento de Engenharia Ambiental', true)
ON CONFLICT DO NOTHING;
-- Municípios IBGE
INSERT INTO core_municipioibge (codigo_ibge, nome, uf, ativo) VALUES
  (2507507, 'João Pessoa', 'PB', true),
  (2504009, 'Campina Grande', 'PB', true),
  (2611606, 'Recife', 'PE', true),
  (2927408, 'Salvador', 'BA', true)
ON CONFLICT (codigo_ibge) DO NOTHING;
-- Naturezas de Extensão
INSERT INTO core_naturezaextensao (id, descricao, ativo) VALUES
  (1, 'Projeto', true),
  (2, 'Programa', true),
  (3, 'Curso', true)
ON CONFLICT DO NOTHING;
-- Linhas de Extensão
INSERT INTO core_linhaextensao (id, descricao, ativo) VALUES
  (1, 'Alfabetização, leitura e escrita', true),
  (2, 'Desenvolvimento tecnológico', true),
  (3, 'Saúde humana', true),
  (4, 'Meio ambiente', true)
ON CONFLICT DO NOTHING;
-- Áreas Temáticas
INSERT INTO core_areatematica (id, descricao, ativo) VALUES
  (1, 'Educação', true),
  (2, 'Tecnologia e Produção', true),
  (3, 'Saúde', true),
  (4, 'Meio Ambiente', true),
  (5, 'Cultura', true),
  (6, 'Direitos Humanos e Justiça', true)
ON CONFLICT DO NOTHING;
-- Áreas de Conhecimento CNPq (Grandes Áreas - nível 1)
INSERT INTO core_areaconhecimentocnpq (codigo, descricao, parent_id, nivel, ativo) VALUES
  (10000003, 'Ciências Exatas e da Terra', NULL, 1, true),
  (40000001, 'Ciências da Saúde', NULL, 1, true),
  (70000000, 'Ciências Humanas', NULL, 1, true),
  (50000006, 'Ciências Agrárias', NULL, 1, true)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO core_pessoaglobal (id, nome_completo, cpf, email_institucional, lattes_url, is_staff, is_active, is_superuser, last_login, password, created_at, updated_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Maria Clara Oliveira',   '11122233344', 'maria.oliveira@universidade.edu.br',  'http://lattes.cnpq.br/1111111111111111', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000002', 'João Pedro Nascimento',  '22233344455', 'joao.nascimento@universidade.edu.br', 'http://lattes.cnpq.br/2222222222222222', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'Ana Beatriz Santos',     '33344455566', 'ana.santos@universidade.edu.br',      'http://lattes.cnpq.br/3333333333333333', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'Carlos Eduardo Ferreira','44455566677', 'carlos.ferreira@universidade.edu.br', 'http://lattes.cnpq.br/4444444444444444', false, true, false, NULL, '', NOW(), NOW())
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO core_vinculoinstitucional (id, pessoa_id, tipo_vinculo, matricula, departamento_id, status, created_at, updated_at) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'PROFESSOR_EFETIVO',   'MAT-2020-001', 1, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'PROFESSOR_EFETIVO',   'MAT-2019-042', 2, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'PROFESSOR_VISITANTE', 'MAT-2023-115', 3, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'PROFESSOR_EFETIVO',   'MAT-2018-078', 4, 'ATIVO', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO projetos_projeto (id, ano, numero, titulo, situacao, coordenador_id, unidade_proponente_id, departamento_proponente_id, excluido, created_at, updated_at) VALUES
  -- Projeto 1: Inclusão Digital
  ('c3000000-0000-0000-0000-000000000001', 2026, 1,
   'Inclusão Digital para Comunidades Rurais do Semiárido Paraibano',
   'APROVADO',
   'b2000000-0000-0000-0000-000000000001', 1, 1, false,
   '2026-03-15 10:00:00', '2026-03-15 10:00:00'),
  -- Projeto 2: Saúde Comunitária
  ('c3000000-0000-0000-0000-000000000002', 2026, 2,
   'Saúde Comunitária: Prevenção e Promoção em Áreas Vulneráveis',
   'EM_EXECUCAO',
   'b2000000-0000-0000-0000-000000000002', 2, 2, false,
   '2026-02-10 09:30:00', '2026-06-20 14:00:00'),
  -- Projeto 3: Educação Inclusiva
  ('c3000000-0000-0000-0000-000000000003', 2025, 5,
   'Educação Inclusiva: Metodologias Ativas para Estudantes com Deficiência',
   'CONCLUIDO',
   'b2000000-0000-0000-0000-000000000003', 3, 3, false,
   '2025-04-01 08:00:00', '2025-12-15 16:30:00'),
  -- Projeto 4: Sustentabilidade Ambiental
  ('c3000000-0000-0000-0000-000000000004', 2026, 3,
   'Sustentabilidade Ambiental: Recuperação de Nascentes no Brejo Paraibano',
   'SUBMETIDO',
   'b2000000-0000-0000-0000-000000000004', 4, 4, false,
   '2026-08-01 11:00:00', '2026-08-01 11:00:00');

INSERT INTO projetos_projetoendereco (id, projeto_id, logradouro, numero, complemento, bairro, municipio_id, cep, created_at, updated_at) VALUES
  ('d4000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001',
   'Rua Aprígio Veloso', '882', 'Bloco CN, Sala 104', 'Universitário', 2504009, '58429-900',
   NOW(), NOW()),
  ('d4000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002',
   'Av. Epitácio Pessoa', '1200', 'Prédio da Saúde, 3º andar', 'Expedicionários', 2507507, '58040-000',
   NOW(), NOW()),
  ('d4000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003',
   'Rua das Trincheiras', '567', '', 'Centro', 2507507, '58011-000',
   NOW(), NOW()),
  ('d4000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004',
   'Av. Marechal Floriano Peixoto', '150', 'Galpão Ambiental', 'Centro', 2611606, '50070-060',
   NOW(), NOW());

INSERT INTO projetos_projetocaracterizacao (id, projeto_id, situacao_academica, vinculado_programa_extensao, curricularizado, natureza_id, abrangencia, publico_alvo, grande_area_cnpq_id, area_tematica_principal_id, area_tematica_secundaria_id, linha_extensao_id, created_at, updated_at) VALUES
  ('e5000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001',
   'NOVO', true, false, 1, 'REGIONAL',
   'Comunidades rurais do semiárido, agricultores familiares, jovens em situação de vulnerabilidade digital.',
   10000003, 2, 1, 2,
   NOW(), NOW()),
  ('e5000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002',
   'RENOVACAO', true, true, 1, 'LOCAL',
   'Moradores de comunidades carentes, agentes comunitários de saúde, gestantes e idosos.',
   40000001, 3, 6, 3,
   NOW(), NOW()),
  ('e5000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003',
   'REESTRUTURACAO', false, true, 2, 'NACIONAL',
   'Professores da rede pública, estudantes com deficiência, coordenadores pedagógicos.',
   70000000, 1, 6, 1,
   NOW(), NOW()),
  ('e5000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004',
   'NOVO', false, false, 1, 'REGIONAL',
   'Agricultores familiares da região do Brejo, associações comunitárias, estudantes de Engenharia Ambiental.',
   50000006, 4, 2, 4,
   NOW(), NOW());

INSERT INTO projetos_projetodescricao (id, projeto_id, resumo, introducao, justificativa, objetivo_geral, objetivos_especificos, metodologia_avaliacao, relacao_ensino, relacao_pesquisa, interacao_dialogica, interdisciplinaridade, impacto_formacao, indissociabilidade, impacto_social, referencias_bibliograficas, created_at, updated_at) VALUES
('f6000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001',
 'Projeto voltado à capacitação digital de comunidades rurais do semiárido paraibano, promovendo inclusão tecnológica e acesso à informação por meio de oficinas e laboratórios itinerantes.',
 'A revolução digital transformou profundamente as relações sociais e econômicas no Brasil. Contudo, comunidades rurais do semiárido nordestino permanecem à margem desse processo, enfrentando barreiras de acesso à internet, falta de equipamentos e ausência de formação tecnológica.',
 'O índice de exclusão digital no semiárido paraibano é alarmante. Segundo dados do IBGE (2023), apenas 38% dos domicílios rurais da Paraíba possuem acesso à internet, contra 87% nas áreas urbanas. Essa disparidade limita oportunidades educacionais, econômicas e de participação cidadã.',
 'Promover a inclusão digital de comunidades rurais do semiárido paraibano, capacitando moradores para uso de tecnologias da informação e comunicação no cotidiano e em atividades produtivas.',
 '1. Realizar diagnóstico de letramento digital em 10 comunidades rurais.\n2. Implantar 5 laboratórios itinerantes com acesso à internet.\n3. Oferecer 20 oficinas de capacitação em ferramentas digitais.\n4. Formar 15 multiplicadores locais em cada comunidade.\n5. Produzir material didático adaptado à realidade rural.',
 'Avaliação contínua por questionários de autopercepção, testes práticos de habilidades digitais, e acompanhamento longitudinal de 6 meses após as oficinas. Indicadores: taxa de participação, nível de letramento digital pré e pós-intervenção, e adoção de ferramentas digitais.',
 true, true,
 'Diálogo permanente com lideranças comunitárias e associações de agricultores para construção coletiva das atividades e adaptação dos conteúdos às demandas locais.',
 'Envolve Computação, Pedagogia, Comunicação Social e Ciências Agrárias na concepção e execução das atividades.',
 'Estudantes de graduação desenvolvem competências em gestão de projetos sociais, comunicação intercultural e aplicação prática de conhecimentos técnicos.',
 'O projeto articula ensino (formação de multiplicadores), pesquisa (diagnóstico e avaliação de impacto) e extensão (oficinas comunitárias).',
 'Espera-se democratizar o acesso à informação, potencializar a comercialização de produtos agrícolas via plataformas digitais e fortalecer a participação cidadã nas comunidades atendidas.',
 'CASTELLS, M. A sociedade em rede. São Paulo: Paz e Terra, 2019.\nSORJ, B. brasil@digital.br. Rio de Janeiro: Jorge Zahar, 2003.\nIBGE. Pesquisa Nacional por Amostra de Domicílios Contínua - TIC 2023.',
 NOW(), NOW());
-- Projeto 2: Saúde Comunitária
INSERT INTO projetos_projetodescricao (id, projeto_id, resumo, introducao, justificativa, objetivo_geral, objetivos_especificos, metodologia_avaliacao, relacao_ensino, relacao_pesquisa, interacao_dialogica, interdisciplinaridade, impacto_formacao, indissociabilidade, impacto_social, referencias_bibliograficas, created_at, updated_at) VALUES
('f6000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002',
 'Ações de promoção da saúde e prevenção de doenças crônicas em comunidades vulneráveis de João Pessoa, com foco em educação em saúde, acompanhamento nutricional e atividades físicas.',
 'As doenças crônicas não transmissíveis (DCNTs) representam a principal causa de morbimortalidade no Brasil. Em comunidades de baixa renda, a falta de acesso a informações e serviços de saúde preventiva agrava esse cenário.',
 'O bairro Expedicionários e adjacências possuem Unidades Básicas de Saúde sobrecarregadas e alto índice de hipertensão e diabetes na população acima de 40 anos. A educação em saúde é ferramenta essencial para a mudança comportamental e prevenção.',
 'Desenvolver ações integradas de promoção da saúde e prevenção de doenças crônicas em comunidades vulneráveis de João Pessoa.',
 '1. Realizar 30 rodas de conversa sobre alimentação saudável.\n2. Oferecer 50 atendimentos de orientação nutricional.\n3. Implementar programa de atividades físicas comunitárias.\n4. Capacitar 20 agentes comunitários de saúde.\n5. Criar cartilha ilustrada de prevenção de DCNTs.',
 'Acompanhamento de indicadores de saúde (pressão arterial, glicemia, IMC) em avaliações trimestrais. Pesquisa qualitativa com grupos focais. Relatórios mensais de participação e adesão.',
 true, true,
 'Escuta ativa das demandas da comunidade por meio de assembleias comunitárias e parcerias com a Estratégia Saúde da Família local.',
 'Integra Enfermagem, Nutrição, Educação Física e Psicologia na formulação e execução das atividades.',
 'Formação em atenção primária à saúde, trabalho em equipe multiprofissional e comunicação em saúde para estudantes de graduação.',
 'Pesquisa epidemiológica alimenta as ações de extensão, que por sua vez geram casos e dados para o ensino em sala de aula.',
 'Redução de fatores de risco para DCNTs, empoderamento comunitário em saúde e fortalecimento da rede de atenção básica local.',
 'BRASIL. Ministério da Saúde. Política Nacional de Promoção da Saúde. Brasília, 2014.\nSCHMIDT, M.I. et al. Doenças crônicas não transmissíveis no Brasil. The Lancet, 2011.\nBUSS, P.M. Promoção da saúde e qualidade de vida. Ciência & Saúde Coletiva, 2000.',
 NOW(), NOW());
-- Projeto 3: Educação Inclusiva
INSERT INTO projetos_projetodescricao (id, projeto_id, resumo, introducao, justificativa, objetivo_geral, objetivos_especificos, metodologia_avaliacao, relacao_ensino, relacao_pesquisa, interacao_dialogica, interdisciplinaridade, impacto_formacao, indissociabilidade, impacto_social, referencias_bibliograficas, created_at, updated_at) VALUES
('f6000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003',
 'Programa de formação continuada para professores da rede pública em metodologias ativas inclusivas, com foco em estudantes com deficiência intelectual e transtorno do espectro autista.',
 'A educação inclusiva é um direito garantido pela Constituição Federal e pela Lei Brasileira de Inclusão (Lei 13.146/2015). Entretanto, a formação docente para o atendimento a estudantes com deficiência ainda é insuficiente na maioria das escolas públicas brasileiras.',
 'Pesquisa realizada pelo grupo de estudos em Educação Especial da universidade revelou que 72% dos professores da rede municipal de João Pessoa não se sentem preparados para atender estudantes com deficiência em sala regular. Há urgência na formação continuada e no desenvolvimento de recursos pedagógicos adaptados.',
 'Capacitar professores da rede pública municipal em metodologias ativas e tecnologias assistivas para promoção da inclusão escolar de estudantes com deficiência.',
 '1. Oferecer curso de formação de 120h para 60 professores.\n2. Desenvolver 30 planos de aula inclusivos validados.\n3. Criar banco de recursos didáticos adaptados.\n4. Realizar 12 encontros de supervisão pedagógica.\n5. Publicar guia de práticas inclusivas.',
 'Avaliação formativa ao longo do curso, análise de portfólios docentes, observação de aulas, e pesquisa de satisfação. Avaliação de impacto após 1 ano via entrevistas com professores e gestores.',
 true, true,
 'Construção participativa do currículo de formação com representantes das escolas, famílias e estudantes com deficiência.',
 'Articula Educação, Psicologia, Fonoaudiologia e Terapia Ocupacional.',
 'Licenciandos atuam como monitores nas formações, desenvolvendo competências em educação inclusiva que complementam sua formação acadêmica.',
 'A pesquisa diagnóstica informa a construção do programa de extensão, que gera dados para dissertações e artigos, realimentando o ensino na graduação.',
 'Melhoria da qualidade da educação inclusiva na rede pública, redução das taxas de evasão de estudantes com deficiência e formação de professores mais preparados.',
 'MANTOAN, M.T.E. Inclusão escolar: O que é? Por quê? Como fazer? São Paulo: Moderna, 2015.\nBRASIL. Lei Brasileira de Inclusão da Pessoa com Deficiência. Lei 13.146/2015.\nGLAT, R.; PLETSCH, M.D. Inclusão escolar de alunos com necessidades especiais. EdUERJ, 2012.',
 NOW(), NOW());
-- Projeto 4: Sustentabilidade Ambiental
INSERT INTO projetos_projetodescricao (id, projeto_id, resumo, introducao, justificativa, objetivo_geral, objetivos_especificos, metodologia_avaliacao, relacao_ensino, relacao_pesquisa, interacao_dialogica, interdisciplinaridade, impacto_formacao, indissociabilidade, impacto_social, referencias_bibliograficas, created_at, updated_at) VALUES
('f6000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004',
 'Projeto de recuperação de nascentes degradadas na região do Brejo Paraibano, combinando técnicas de engenharia ambiental com educação ambiental comunitária e monitoramento hídrico participativo.',
 'O Brejo Paraibano possui microclima diferenciado e riqueza hídrica que, nas últimas décadas, vem sendo ameaçada pelo desmatamento, uso inadequado do solo e contaminação por agrotóxicos. Nascentes que abasteciam comunidades inteiras estão secando ou contaminadas.',
 'Levantamento realizado pelo Departamento de Engenharia Ambiental identificou que 40% das nascentes catalogadas na microrregião do Brejo apresentam algum grau de degradação. A recuperação dessas nascentes é essencial para a segurança hídrica da população e a conservação da biodiversidade.',
 'Recuperar nascentes degradadas na região do Brejo Paraibano por meio de técnicas sustentáveis e educação ambiental participativa.',
 '1. Mapear e diagnosticar 25 nascentes na região do Brejo.\n2. Implementar técnicas de recuperação em 10 nascentes prioritárias.\n3. Realizar 15 oficinas de educação ambiental.\n4. Formar 30 monitores ambientais comunitários.\n5. Instalar 10 estações de monitoramento hídrico simplificado.',
 'Análise de qualidade da água (parâmetros físico-químicos e microbiológicos) antes e após intervenções. Monitoramento de vazão. Questionários de percepção ambiental da comunidade. Relatórios semestrais de progresso.',
 true, true,
 'Mapeamento participativo com comunidades ribeirinhas e agricultores para definição de nascentes prioritárias e construção coletiva das estratégias de recuperação.',
 'Engenharia Ambiental, Biologia, Geografia, Ciências Agrárias e Educação Ambiental.',
 'Estudantes atuam em campo, desenvolvendo competências em diagnóstico ambiental, trabalho interdisciplinar e engajamento comunitário.',
 'A pesquisa de monitoramento hídrico alimenta artigos científicos, o ensino de campo proporciona vivência prática, e a extensão promove transformação socioambiental.',
 'Recuperação da disponibilidade hídrica para comunidades rurais, conservação de ecossistemas de nascentes, e empoderamento comunitário para gestão ambiental participativa.',
 'AB''SÁBER, A.N. Os domínios de natureza no Brasil. São Paulo: Ateliê Editorial, 2003.\nTUNDISI, J.G. Água no Século XXI: Enfrentando a Escassez. São Carlos: RiMa, 2003.\nBRASIL. Código Florestal. Lei 12.651/2012.',
 NOW(), NOW());

 -- Pessoas extras (membros de equipe que não são coordenadores)
INSERT INTO core_pessoaglobal (id, nome_completo, cpf, email_institucional, lattes_url, is_staff, is_active, is_superuser, last_login, password, created_at, updated_at) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'Fernanda Lima Souza',     '55566677788', 'fernanda.souza@universidade.edu.br',  '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000006', 'Rafael Costa Mendes',     '66677788899', 'rafael.mendes@universidade.edu.br',   '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000007', 'Juliana Rocha Almeida',   '77788899900', 'juliana.almeida@universidade.edu.br', '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000008', 'Lucas Martins Pereira',   '88899900011', 'lucas.pereira@universidade.edu.br',   '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000009', 'Camila Barbosa Dias',     '99900011122', 'camila.dias@universidade.edu.br',     '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000010', 'Pedro Henrique Araújo',   '10011122233', 'pedro.araujo@universidade.edu.br',    '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000011', 'Isabela Moreira Castro',  '11122233355', 'isabela.castro@universidade.edu.br',  '', false, true, false, NULL, '', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000012', 'Thiago Nunes Ribeiro',    '12233344466', 'thiago.ribeiro@universidade.edu.br',  '', false, true, false, NULL, '', NOW(), NOW())
ON CONFLICT (cpf) DO NOTHING;
-- Vínculos extras (discentes e técnicos)
INSERT INTO core_vinculoinstitucional (id, pessoa_id, tipo_vinculo, matricula, departamento_id, status, created_at, updated_at) VALUES
  ('b2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'ALUNO_GRADUACAO',         'ALU-2024-001', 1, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'TECNICO_ADMINISTRATIVO',  'TEC-2021-010', 1, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007', 'ALUNO_GRADUACAO',         'ALU-2023-045', 2, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'PROFESSOR_EFETIVO',       'MAT-2017-033', 2, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000009', 'ALUNO_POS_GRADUACAO',     'POS-2024-012', 3, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000010', 'ALUNO_GRADUACAO',         'ALU-2024-078', 3, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000011', 'TECNICO_ADMINISTRATIVO',  'TEC-2020-005', 4, 'ATIVO', NOW(), NOW()),
  ('b2000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000012', 'ALUNO_GRADUACAO',         'ALU-2025-003', 4, 'ATIVO', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO projetos_projetocontato (id, projeto_id, tipo_contato, valor, ddd, ramal, tipo_telefone, created_at, updated_at) VALUES
  -- Projeto 1
  ('aa100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'EMAIL',    'inclusaodigital@universidade.edu.br', '', '', '', NOW(), NOW()),
  ('aa100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'TELEFONE', '33101234', '83', '', 'COMERCIAL', NOW(), NOW()),
  -- Projeto 2
  ('aa100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002', 'EMAIL',    'saudecomunitaria@universidade.edu.br', '', '', '', NOW(), NOW()),
  ('aa100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002', 'TELEFONE', '999887766', '83', '', 'CELULAR', NOW(), NOW()),
  -- Projeto 3
  ('aa100000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000003', 'EMAIL',    'educainclusiva@universidade.edu.br', '', '', '', NOW(), NOW()),
  ('aa100000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000003', 'TELEFONE', '32165432', '83', '205', 'COMERCIAL', NOW(), NOW()),
  -- Projeto 4
  ('aa100000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000004', 'EMAIL',    'nascentes.brejo@universidade.edu.br', '', '', '', NOW(), NOW()),
  ('aa100000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000004', 'TELEFONE', '998765432', '83', '', 'CELULAR', NOW(), NOW());


  INSERT INTO projetos_projetopalavrachave (id, projeto_id, palavra, created_at, updated_at) VALUES
  -- Projeto 1
  ('bb100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Inclusão Digital', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'Semiárido', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'Letramento Tecnológico', NOW(), NOW()),
  -- Projeto 2
  ('bb100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002', 'Saúde Comunitária', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000002', 'Prevenção de Doenças', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000002', 'Promoção da Saúde', NOW(), NOW()),
  -- Projeto 3
  ('bb100000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000003', 'Educação Inclusiva', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000003', 'Metodologias Ativas', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000009', 'c3000000-0000-0000-0000-000000000003', 'Acessibilidade', NOW(), NOW()),
  -- Projeto 4
  ('bb100000-0000-0000-0000-000000000010', 'c3000000-0000-0000-0000-000000000004', 'Recuperação de Nascentes', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000011', 'c3000000-0000-0000-0000-000000000004', 'Educação Ambiental', NOW(), NOW()),
  ('bb100000-0000-0000-0000-000000000012', 'c3000000-0000-0000-0000-000000000004', 'Recursos Hídricos', NOW(), NOW());

  INSERT INTO projetos_planotrabalho (id, projeto_id, ano, resultados_esperados, cronograma_atividades, created_at, updated_at) VALUES
  -- Projeto 1
  ('cc100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 2026,
   'Capacitação de 150 moradores em ferramentas digitais básicas. Formação de 60 multiplicadores locais. Implantação de 5 laboratórios itinerantes funcionais.',
   'Mar-Abr: Diagnóstico nas comunidades. Mai-Jul: Implantação dos laboratórios. Ago-Out: Oficinas de capacitação. Nov-Dez: Avaliação e formação de multiplicadores.',
   NOW(), NOW()),
  -- Projeto 2
  ('cc100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002', 2026,
   'Atendimento de 200 pessoas em orientação nutricional. Redução de 15% nos índices de pressão arterial elevada entre participantes. Capacitação de 20 ACS.',
   'Jan-Mar: Planejamento e articulação com UBS. Abr-Jun: Rodas de conversa e aferições. Jul-Set: Programa de atividades físicas. Out-Dez: Avaliação de impacto.',
   NOW(), NOW()),
  -- Projeto 3
  ('cc100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 2025,
   'Formação de 60 professores. Produção de 30 planos de aula inclusivos. Publicação de guia de práticas inclusivas.',
   'Abr-Mai: Seleção de professores e diagnóstico. Jun-Set: Módulos de formação. Out-Nov: Supervisão pedagógica e aplicação. Dez: Seminário de encerramento e publicação.',
   NOW(), NOW()),
  -- Projeto 4
  ('cc100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004', 2026,
   'Mapeamento de 25 nascentes. Recuperação de 10 nascentes prioritárias. Formação de 30 monitores ambientais comunitários.',
   'Set-Out: Mapeamento e diagnóstico. Nov-Jan: Intervenções de recuperação (fase 1). Fev-Abr: Oficinas de educação ambiental. Mai-Jul: Instalação de estações de monitoramento. Ago: Relatório final.',
   NOW(), NOW());


   INSERT INTO projetos_demandabolsa (id, projeto_id, tipo_bolsa, quantidade, justificativa, created_at, updated_at) VALUES
  -- Projeto 1
  ('dd100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'EXTENSAO', 3,
   'Bolsistas para conduzir oficinas de capacitação digital nas comunidades rurais e auxiliar na manutenção dos laboratórios itinerantes.', NOW(), NOW()),
  ('dd100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'IC', 1,
   'Bolsista para pesquisa de avaliação de impacto do letramento digital nas comunidades atendidas.', NOW(), NOW()),
  -- Projeto 2
  ('dd100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002', 'EXTENSAO', 4,
   'Bolsistas de Enfermagem e Nutrição para conduzir atividades nas comunidades e realizar acompanhamento dos participantes.', NOW(), NOW()),
  ('dd100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002', 'MONITORIA', 2,
   'Monitores para apoiar a logística das rodas de conversa e organização de materiais educativos.', NOW(), NOW()),
  -- Projeto 3
  ('dd100000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000003', 'EXTENSAO', 2,
   'Bolsistas para atuar como monitores nos módulos de formação continuada dos professores.', NOW(), NOW()),
  ('dd100000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000003', 'IC', 2,
   'Bolsistas para pesquisa sobre eficácia das metodologias inclusivas aplicadas nas escolas parceiras.', NOW(), NOW()),
  -- Projeto 4
  ('dd100000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000004', 'EXTENSAO', 3,
   'Bolsistas para trabalho de campo nas nascentes: coleta de amostras, monitoramento e oficinas com comunidades.', NOW(), NOW()),
  ('dd100000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000004', 'IC', 1,
   'Bolsista para análise laboratorial de qualidade da água e elaboração de relatórios técnicos.', NOW(), NOW());


   INSERT INTO projetos_projetounidade (id, projeto_id, unidade_id, tipo_participacao, created_at, updated_at) VALUES
  -- Projeto 1 (CCT proponente + CCH apoiadora)
  ('ee100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 1, 'PROPONENTE', NOW(), NOW()),
  ('ee100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 3, 'APOIADORA', NOW(), NOW()),
  -- Projeto 2 (CCS proponente + CCT apoiadora)
  ('ee100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002', 2, 'PROPONENTE', NOW(), NOW()),
  ('ee100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002', 1, 'APOIADORA', NOW(), NOW()),
  -- Projeto 3 (CCH proponente + CCS executora)
  ('ee100000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000003', 3, 'PROPONENTE', NOW(), NOW()),
  ('ee100000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000003', 2, 'EXECUTORA', NOW(), NOW()),
  -- Projeto 4 (CCAE proponente + CCT executora)
  ('ee100000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000004', 4, 'PROPONENTE', NOW(), NOW()),
  ('ee100000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000004', 1, 'EXECUTORA', NOW(), NOW());

  INSERT INTO projetos_localrealizacao (id, projeto_id, nome_local, municipio_id, endereco_completo, created_at, updated_at) VALUES
  -- Projeto 1
  ('ff100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Escola Municipal José de Alencar', 2504009,
   'Rua do Saber, 45, Zona Rural, Campina Grande - PB', NOW(), NOW()),
  ('ff100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'Associação de Agricultores do Semiárido', 2504009,
   'Sítio Boa Vista, s/n, Zona Rural, Campina Grande - PB', NOW(), NOW()),
  -- Projeto 2
  ('ff100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002', 'UBS Expedicionários', 2507507,
   'Av. Epitácio Pessoa, 1180, Expedicionários, João Pessoa - PB', NOW(), NOW()),
  -- Projeto 3
  ('ff100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000003', 'Escola Estadual Professora Maria das Neves', 2507507,
   'Rua Duque de Caxias, 320, Centro, João Pessoa - PB', NOW(), NOW()),
  ('ff100000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000003', 'Centro de Educação da Universidade', 2507507,
   'Campus I, Bloco CE, Cidade Universitária, João Pessoa - PB', NOW(), NOW()),
  -- Projeto 4
  ('ff100000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000004', 'Nascente do Rio Mamanguape', 2504009,
   'Zona Rural, Distrito de São José da Mata, Campina Grande - PB', NOW(), NOW()),
  ('ff100000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000004', 'Sede da Associação Comunitária do Brejo', 2504009,
   'Rua Principal, s/n, Distrito de Galante, Campina Grande - PB', NOW(), NOW());


   INSERT INTO projetos_parceriainterna (id, projeto_id, unidade_id, departamento_id, nome_instituicao, sigla_instituicao, participacao, created_at, updated_at) VALUES
  -- Projeto 1 (parceria com CCH)
  ('11100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 3, 3,
   'Centro de Ciências Humanas', 'CCH',
   'Apoio pedagógico na elaboração de material didático adaptado para comunidades rurais.', NOW(), NOW()),
  -- Projeto 2 (parceria com CCT)
  ('11100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002', 1, 1,
   'Centro de Ciências e Tecnologia', 'CCT',
   'Desenvolvimento de aplicativo para acompanhamento dos indicadores de saúde dos participantes.', NOW(), NOW()),
  -- Projeto 3 (parceria com CCS)
  ('11100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 2, 2,
   'Centro de Ciências da Saúde', 'CCS',
   'Apoio de fonoaudiólogos e terapeutas ocupacionais nas formações sobre tecnologias assistivas.', NOW(), NOW()),
  -- Projeto 4 (parceria com CCT)
  ('11100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004', 1, 1,
   'Centro de Ciências e Tecnologia', 'CCT',
   'Suporte na instalação de sensores IoT para monitoramento remoto da qualidade da água.', NOW(), NOW());

INSERT INTO projetos_parceriaexterna (id, projeto_id, nome_instituicao, sigla_instituicao, tipo_instituicao, participacao, created_at, updated_at) VALUES
  -- Projeto 1
  ('22100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001',
   'Secretaria de Ciência e Tecnologia da Paraíba', 'SECITEC-PB', 'GOV_ESTADUAL',
   'Financiamento de equipamentos e conectividade para os laboratórios itinerantes.', NOW(), NOW()),
  -- Projeto 2
  ('22100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002',
   'Secretaria Municipal de Saúde de João Pessoa', 'SMS-JP', 'GOV_MUNICIPAL',
   'Cessão de espaço nas UBS e mobilização dos agentes comunitários de saúde.', NOW(), NOW()),
  -- Projeto 3
  ('22100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003',
   'Instituto Rodrigo Mendes', 'IRM', 'ONG',
   'Consultoria técnica em educação inclusiva e cessão de materiais pedagógicos adaptados.', NOW(), NOW()),
  -- Projeto 4
  ('22100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004',
   'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis', 'IBAMA', 'GOV_FEDERAL',
   'Apoio técnico no diagnóstico ambiental e licenciamento das intervenções de recuperação.', NOW(), NOW());


INSERT INTO projetos_membroequipe (id, projeto_id, vinculo_id, funcao, carga_horaria_semanal, data_entrada, data_saida, created_at, updated_at) VALUES
  -- Projeto 1: coordenador + bolsista + técnico
  ('33100000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'COORDENADOR', 20, '2026-03-15', NULL, NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000005', 'BOLSISTA', 12, '2026-04-01', NULL, NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000006', 'TECNICO', 10, '2026-03-15', NULL, NOW(), NOW()),
  -- Projeto 2: coordenador + bolsista + docente colaborador
  ('33100000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'COORDENADOR', 20, '2026-02-10', NULL, NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000007', 'BOLSISTA', 12, '2026-03-01', NULL, NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000008', 'DOCENTE_COLABORADOR', 8, '2026-02-10', NULL, NOW(), NOW()),
  -- Projeto 3: coordenador + voluntário + discente
  ('33100000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003', 'COORDENADOR', 20, '2025-04-01', '2025-12-15', NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000009', 'VOLUNTARIO', 8, '2025-04-15', '2025-12-15', NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000009', 'c3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000010', 'DISCENTE', 10, '2025-05-01', '2025-11-30', NOW(), NOW()),
  -- Projeto 4: coordenador + bolsista + técnico
  ('33100000-0000-0000-0000-000000000010', 'c3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004', 'COORDENADOR', 20, '2026-08-01', NULL, NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000011', 'c3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000011', 'TECNICO', 10, '2026-08-01', NULL, NOW(), NOW()),
  ('33100000-0000-0000-0000-000000000012', 'c3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000012', 'BOLSISTA', 12, '2026-08-15', NULL, NOW(), NOW());

  SELECT * FROM projetos_projetopalavrachave;