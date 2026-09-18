from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


MOCK_PROJETO_IMPRESSAO = {
    "projeto": {
        "id": "00000000-0000-0000-0000-000000000000",
        "ano": 2026,
        "numero": 8507,
        "titulo": "Matemática para Todos: extensão e cidadania na Região Metropolitana do Rio de Janeiro",
        "situacao": "Em Execução",
        "coordenador": "Maria da Silva — Professora Adjunta",
        "unidade_proponente": "IME — Instituto de Matemática e Estatística",
        "departamento_proponente": "Departamento de Matemática Aplicada (IME)",
        "criado_em": "15/05/2026",
        "atualizado_em": "06/09/2026",
    },
    "endereco": {
        "logradouro": "Rua São Francisco Xavier",
        "numero": "524",
        "complemento": "Sala 6028, Bloco B",
        "bairro": "Maracanã",
        "municipio": "Rio de Janeiro/RJ",
        "cep": "20550-900",
    },
    "contatos": [
        {"tipo": "E-mail", "valor": "matematica.para.todos@uerj.br"},
        {
            "tipo": "Telefone",
            "valor": "(21) 2334-0340",
            "ddd": "21",
            "ramal": "340",
            "tipo_telefone": "Comercial",
        },
    ],
    "caracterizacao": {
        "situacao_academica": "Novo",
        "vinculado_programa_extensao": True,
        "curricularizado": False,
        "natureza": "Projeto",
        "abrangencia": "Regional",
        "publico_alvo": "Estudantes do ensino médio da rede pública e comunidade do entorno da UERJ.",
        "grande_area_cnpq": "1 - Ciências Exatas e da Terra",
        "area_tematica_principal": "Educação",
        "area_tematica_secundaria": "Cultura",
        "linha_extensao": "Alfabetização, leitura e escrita",
    },
    "descricao": {
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
            "ano": 2026,
            "resultados_esperados": "Atender 200 estudantes em 10 oficinas.",
            "cronograma_atividades": "Mar-Jun: oficinas; Jul: mostra; Ago-Dez: avaliação.",
        },
        {
            "ano": 2027,
            "resultados_esperados": "Ampliar para 300 estudantes e 2 escolas parceiras.",
            "cronograma_atividades": "Fev-Abr: planejamento; Mai-Out: execução; Nov: relatório.",
        },
    ],
    "demandas_bolsa": [
        {
            "tipo": "Extensão",
            "quantidade": 2,
            "justificativa": "Monitores para as oficinas semanais.",
        },
        {
            "tipo": "Iniciação Científica",
            "quantidade": 1,
            "justificativa": "Apoio à sistematização dos resultados.",
        },
    ],
    "unidades_envolvidas": [
        {"sigla": "IME", "nome": "Instituto de Matemática e Estatística", "participacao": "Proponente"},
        {"sigla": "FEN", "nome": "Faculdade de Engenharia", "participacao": "Apoiadora"},
    ],
    "locais_realizacao": [
        {
            "nome": "Auditório do IME",
            "municipio": "Rio de Janeiro/RJ",
            "endereco_completo": "Rua São Francisco Xavier, 524, Maracanã",
        },
        {
            "nome": "Escola Municipal Parceira",
            "municipio": "Duque de Caxias/RJ",
            "endereco_completo": "Rua Exemplo, 100, Centro",
        },
    ],
    "parcerias_internas": [
        {
            "unidade": "FEN",
            "departamento": "Departamento de Engenharia de Produção",
            "nome_contato": "João Souza",
            "descricao_contribuicao": "Apoio logístico e divulgação.",
            "formalizado_convenio": False,
        }
    ],
    "parcerias_externas": [
        {
            "nome_instituicao": "Secretaria Municipal de Educação",
            "cnpj": "",
            "tipo_instituicao": "Pública",
            "nome_contato": "Ana Pereira",
            "descricao_contribuicao": "Mobilização das escolas e cessão de espaço.",
            "formalizado_convenio": True,
        }
    ],
    "equipe": [
        {"nome": "Maria da Silva", "funcao": "Coordenadora", "carga_horaria_semanal": 8},
        {"nome": "João Souza", "funcao": "Docente Colaborador", "carga_horaria_semanal": 4},
        {"nome": "Carla Oliveira", "funcao": "Bolsista", "carga_horaria_semanal": 20},
        {"nome": "Pedro Santos", "funcao": "Voluntário", "carga_horaria_semanal": 6},
    ],
}


class ProjetoImpressaoMockView(APIView):
    """Retorna o DTO mockado de impressão de um projeto."""

    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        payload = dict(MOCK_PROJETO_IMPRESSAO)
        payload["projeto"] = dict(MOCK_PROJETO_IMPRESSAO["projeto"])
        if pk is not None:
            payload["projeto"]["id"] = str(pk)
        return Response(payload)
