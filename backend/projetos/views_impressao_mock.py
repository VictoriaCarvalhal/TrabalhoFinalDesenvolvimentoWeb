import copy

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


MOCK_PROJETO_IMPRESSAO = {
    "projeto": {
        "id": "00000000-0000-0000-0000-000000000000",
        "ano": 2026,
        "numero": 8507,
        "titulo": "Matemática para Todos: extensão e cidadania na Região Metropolitana do Rio de Janeiro",
        "situacao": "EM_EXECUCAO",
        "situacao_display": "Em Execução",
        "coordenador": "11111111-1111-4111-8111-111111111111",
        "coordenador_nome": "Maria da Silva",
        "unidade_proponente": 1,
        "unidade_sigla": "IME",
        "unidade_nome": "Instituto de Matemática e Estatística",
        "departamento_proponente": 1,
        "departamento_nome": "Departamento de Matemática Aplicada",
        "created_at": "2026-05-15T10:00:00-03:00",
        "updated_at": "2026-09-06T18:30:00-03:00",
    },
    "endereco": {
        "id": "a0000000-0000-4000-8000-000000000001",
        "logradouro": "Rua São Francisco Xavier",
        "numero": "524",
        "complemento": "Sala 6028, Bloco B",
        "bairro": "Maracanã",
        "municipio": 3304557,
        "municipio_nome": "Rio de Janeiro",
        "municipio_uf": "RJ",
        "cep": "20550-900",
    },
    "contatos": [
        {
            "id": "b0000000-0000-4000-8000-000000000001",
            "tipo_contato": "EMAIL",
            "tipo_contato_display": "E-mail",
            "valor": "matematica.para.todos@uerj.br",
            "ddd": "",
            "ramal": "",
            "tipo_telefone": "",
            "tipo_telefone_display": "",
        },
        {
            "id": "b0000000-0000-4000-8000-000000000002",
            "tipo_contato": "TELEFONE",
            "tipo_contato_display": "Telefone",
            "valor": "2334-0340",
            "ddd": "21",
            "ramal": "340",
            "tipo_telefone": "COMERCIAL",
            "tipo_telefone_display": "Comercial",
        },
    ],
    "caracterizacao": {
        "id": "c0000000-0000-4000-8000-000000000001",
        "situacao_academica": "NOVO",
        "vinculado_programa_extensao": True,
        "curricularizado": False,
        "natureza": 1,
        "natureza_display": "Projeto",
        "abrangencia": "REGIONAL",
        "publico_alvo": "Estudantes do ensino médio da rede pública e comunidade do entorno da UERJ.",
        "grande_area_cnpq": 1,
        "grande_area_display": "Ciências Exatas e da Terra",
        "area_tematica_principal": 1,
        "area_principal_display": "Educação",
        "area_tematica_secundaria": 2,
        "area_secundaria_display": "Cultura",
        "linha_extensao": 1,
        "linha_extensao_display": "Alfabetização, leitura e escrita",
    },
    "descricao": {
        "id": "d0000000-0000-4000-8000-000000000001",
        "resumo": "Projeto de extensão que oferece oficinas de matemática básica e olimpíadas para estudantes da rede pública.",
        "palavras_chave": ["matemática", "extensão", "educação", "cidadania", "UERJ"],
        "introducao": "Texto mockado da introdução do projeto.",
        "justificativa": "Texto mockado da justificativa do projeto.",
        "objetivo_geral": "Popularizar a matemática junto à comunidade escolar.",
        "objetivos_especificos": "1) Oficinas semanais; 2) Formação de monitores; 3) Mostra anual.",
        "metodologia_avaliacao": "Oficinas presenciais com avaliação por frequência e questionários.",
        "relacao_ensino": True,
        "relacao_pesquisa": False,
        "interacao_dialogica": "Texto mockado de interação dialógica.",
        "interdisciplinaridade": "Texto mockado de interdisciplinaridade.",
        "impacto_formacao": "Texto mockado de impacto na formação.",
        "indissociabilidade": "Texto mockado de indissociabilidade ensino-pesquisa-extensão.",
        "impacto_social": "Texto mockado de impacto social.",
        "referencias_bibliograficas": "FREIRE, P. Pedagogia da autonomia. São Paulo: Paz e Terra, 1996.",
    },
    "planos_trabalho": [
        {
            "id": "e0000000-0000-4000-8000-000000000001",
            "ano": 2026,
            "resultados_esperados": "Atender 200 estudantes em 10 oficinas.",
            "cronograma_atividades": "Mar-Jun: oficinas; Jul: mostra; Ago-Dez: avaliação.",
        },
        {
            "id": "e0000000-0000-4000-8000-000000000002",
            "ano": 2027,
            "resultados_esperados": "Ampliar para 300 estudantes e 2 escolas parceiras.",
            "cronograma_atividades": "Fev-Abr: planejamento; Mai-Out: execução; Nov: relatório.",
        },
    ],
    "demandas_bolsa": [
        {
            "id": "f0000000-0000-4000-8000-000000000001",
            "tipo_bolsa": "EXTENSAO",
            "tipo_bolsa_display": "Extensão",
            "quantidade": 2,
            "justificativa": "Monitores para as oficinas semanais.",
        },
        {
            "id": "f0000000-0000-4000-8000-000000000002",
            "tipo_bolsa": "IC",
            "tipo_bolsa_display": "Iniciação Científica",
            "quantidade": 1,
            "justificativa": "Apoio à sistematização dos resultados.",
        },
    ],
    "unidades_envolvidas": [
        {
            "id": "a1000000-0000-4000-8000-000000000001",
            "unidade": 1,
            "unidade_sigla": "IME",
            "unidade_nome": "Instituto de Matemática e Estatística",
            "tipo_participacao": "PROPONENTE",
            "tipo_participacao_display": "Proponente",
        },
        {
            "id": "a1000000-0000-4000-8000-000000000002",
            "unidade": 2,
            "unidade_sigla": "FEN",
            "unidade_nome": "Faculdade de Engenharia",
            "tipo_participacao": "APOIADORA",
            "tipo_participacao_display": "Apoiadora",
        },
    ],
    "locais_realizacao": [
        {
            "id": "a2000000-0000-4000-8000-000000000001",
            "nome_local": "Auditório do IME",
            "municipio": 3304557,
            "municipio_nome": "Rio de Janeiro",
            "municipio_uf": "RJ",
            "endereco_completo": "Rua São Francisco Xavier, 524, Maracanã",
        },
        {
            "id": "a2000000-0000-4000-8000-000000000002",
            "nome_local": "Escola Municipal Parceira",
            "municipio": 3301702,
            "municipio_nome": "Duque de Caxias",
            "municipio_uf": "RJ",
            "endereco_completo": "Rua Exemplo, 100, Centro",
        },
    ],
    "parcerias_internas": [
        {
            "id": "a3000000-0000-4000-8000-000000000001",
            "unidade": 2,
            "unidade_sigla": "FEN",
            "unidade_nome": "Faculdade de Engenharia",
            "departamento": 2,
            "departamento_nome": "Departamento de Engenharia de Produção",
            "nome_instituicao": "Faculdade de Engenharia",
            "sigla_instituicao": "FEN",
            "participacao": "Apoio logístico e divulgação.",
        }
    ],
    "parcerias_externas": [
        {
            "id": "a4000000-0000-4000-8000-000000000001",
            "nome_instituicao": "Secretaria Municipal de Educação",
            "sigla_instituicao": "SME",
            "tipo_instituicao": "GOV_MUNICIPAL",
            "tipo_instituicao_display": "Instituição Governamental Municipal",
            "participacao": "Mobilização das escolas e cessão de espaço.",
        }
    ],
    "membros_equipe": [
        {
            "id": "a5000000-0000-4000-8000-000000000001",
            "vinculo": "11111111-1111-4111-8111-111111111111",
            "nome": "Maria da Silva",
            "cpf": "12345678901",
            "matricula": "SIAPE123",
            "tipo_vinculo": "PROFESSOR_EFETIVO",
            "tipo_vinculo_display": "Professor Efetivo",
            "funcao": "COORDENADOR",
            "funcao_display": "Coordenador(a)",
            "carga_horaria_semanal": 8,
            "data_entrada": "2026-05-15",
            "data_saida": None,
        },
        {
            "id": "a5000000-0000-4000-8000-000000000002",
            "vinculo": "22222222-2222-4222-8222-222222222222",
            "nome": "João Souza",
            "cpf": "23456789012",
            "matricula": "SIAPE456",
            "tipo_vinculo": "PROFESSOR_EFETIVO",
            "tipo_vinculo_display": "Professor Efetivo",
            "funcao": "DOCENTE_COLABORADOR",
            "funcao_display": "Docente Colaborador(a)",
            "carga_horaria_semanal": 4,
            "data_entrada": "2026-05-20",
            "data_saida": None,
        },
        {
            "id": "a5000000-0000-4000-8000-000000000003",
            "vinculo": "33333333-3333-4333-8333-333333333333",
            "nome": "Carla Oliveira",
            "cpf": "34567890123",
            "matricula": "2026001",
            "tipo_vinculo": "ALUNO_GRADUACAO",
            "tipo_vinculo_display": "Aluno de Graduação Não Bolsista",
            "funcao": "BOLSISTA",
            "funcao_display": "Bolsista",
            "carga_horaria_semanal": 20,
            "data_entrada": "2026-06-01",
            "data_saida": None,
        },
        {
            "id": "a5000000-0000-4000-8000-000000000004",
            "vinculo": "44444444-4444-4444-8444-444444444444",
            "nome": "Pedro Santos",
            "cpf": "45678901234",
            "matricula": "",
            "tipo_vinculo": "EXTERNO",
            "tipo_vinculo_display": "Externo",
            "funcao": "VOLUNTARIO",
            "funcao_display": "Voluntário(a)",
            "carga_horaria_semanal": 6,
            "data_entrada": "2026-06-10",
            "data_saida": None,
        },
    ],
}


class ProjetoImpressaoMockView(APIView):
    """Retorna o DTO mockado de impressão de um projeto.
    """

    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        payload = copy.deepcopy(MOCK_PROJETO_IMPRESSAO)
        if pk is not None:
            payload["projeto"]["id"] = str(pk)
        return Response(payload)
