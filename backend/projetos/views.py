"""Endpoints das abas do formulario que aceitam varias linhas.

Todas as rotas ficam embaixo de um projeto:

    /api/v1/projetos/<projeto_id>/unidades-envolvidas/
    /api/v1/projetos/<projeto_id>/locais-realizacao/
    /api/v1/projetos/<projeto_id>/parcerias-internas/
    /api/v1/projetos/<projeto_id>/parcerias-externas/
    /api/v1/projetos/<projeto_id>/membros-equipe/
    /api/v1/projetos/<projeto_id>/demandas-bolsa/
    /api/v1/projetos/<projeto_id>/planos-trabalho/
    /api/v1/projetos/<projeto_id>/abas/          (leitura de tudo de uma vez)

Cada uma responde GET (lista), POST (nova linha), GET/PUT/PATCH/DELETE
em <id>/ para uma linha. Projeto que nao pertence ao usuario logado da 404,
igual a projeto inexistente, para nao revelar que ele existe.
"""
from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from projetos.models import (
    DemandaBolsa, LocalRealizacao, MembroEquipe, ParceriaExterna,
    ParceriaInterna, PlanoTrabalho, ProjetoUnidade,
    ProjetoEndereco, ProjetoCaracterizacao, ProjetoDescricao,Projeto
)
from projetos.permissions import projetos_visiveis_para
from projetos.serializers import (
    DemandaBolsaSerializer, LocalRealizacaoSerializer, MembroEquipeSerializer,
    ParceriaExternaSerializer, ParceriaInternaSerializer,
    PlanoTrabalhoSerializer, UnidadeEnvolvidaSerializer,
    ProjetoResumoSerializer, ProjetoDetalheSimplesSerializer,
    ProjetoEnderecoSerializer, ProjetoContatoSerializer,
    ProjetoCaracterizacaoSerializer, ProjetoDescricaoSerializer
)





class ProjetoDaUrlMixin:
    """Resolve o <projeto_id> da URL para um projeto que o usuario pode ver."""
    permission_classes = [permissions.IsAuthenticated]

    def get_projeto(self):
        if not hasattr(self, '_projeto'):
            self._projeto = get_object_or_404(
                projetos_visiveis_para(self.request.user),
                pk=self.kwargs['projeto_id'],
            )
        return self._projeto


class AbaDoProjetoViewSet(ProjetoDaUrlMixin, viewsets.ModelViewSet):
    """CRUD das linhas de uma aba, sempre restrito ao projeto da URL."""
    # As abas tem poucas linhas; o front recebe a lista inteira, sem paginas.
    pagination_class = None
    # Chaves estrangeiras cujo nome entra na resposta, para evitar N+1.
    select_related = ()

    def get_queryset(self):
        return (
            self.queryset
            .filter(projeto=self.get_projeto())
            .select_related(*self.select_related)
        )

    def get_serializer_context(self):
        contexto = super().get_serializer_context()
        contexto['projeto'] = self.get_projeto()
        return contexto

    def perform_create(self, serializer):
        serializer.save(projeto=self.get_projeto())


class UnidadeEnvolvidaViewSet(AbaDoProjetoViewSet):
    queryset = ProjetoUnidade.objects.all()
    serializer_class = UnidadeEnvolvidaSerializer
    select_related = ('unidade',)


class LocalRealizacaoViewSet(AbaDoProjetoViewSet):
    queryset = LocalRealizacao.objects.all()
    serializer_class = LocalRealizacaoSerializer
    select_related = ('municipio',)


class ParceriaInternaViewSet(AbaDoProjetoViewSet):
    queryset = ParceriaInterna.objects.all()
    serializer_class = ParceriaInternaSerializer
    select_related = ('unidade', 'departamento')


class ParceriaExternaViewSet(AbaDoProjetoViewSet):
    queryset = ParceriaExterna.objects.all()
    serializer_class = ParceriaExternaSerializer


class MembroEquipeViewSet(AbaDoProjetoViewSet):
    queryset = MembroEquipe.objects.all()
    serializer_class = MembroEquipeSerializer
    select_related = ('vinculo', 'vinculo__pessoa')


class DemandaBolsaViewSet(AbaDoProjetoViewSet):
    queryset = DemandaBolsa.objects.all()
    serializer_class = DemandaBolsaSerializer


class PlanoTrabalhoViewSet(AbaDoProjetoViewSet):
    queryset = PlanoTrabalho.objects.all()
    serializer_class = PlanoTrabalhoSerializer


# Aba -> (viewset, related_name no Projeto). A ordem e a das abas na tela.
ABAS = [
    ('unidades_envolvidas', UnidadeEnvolvidaViewSet, 'projeto_unidades'),
    ('locais_realizacao', LocalRealizacaoViewSet, 'locais_realizacao'),
    ('parcerias_internas', ParceriaInternaViewSet, 'parcerias_internas'),
    ('parcerias_externas', ParceriaExternaViewSet, 'parcerias_externas'),
    ('membros_equipe', MembroEquipeViewSet, 'membros'),
    ('demandas_bolsa', DemandaBolsaViewSet, 'demandas_bolsa'),
    ('planos_trabalho', PlanoTrabalhoViewSet, 'planos_trabalho'),
]


class AbasDoProjetoView(ProjetoDaUrlMixin, APIView):
    """Todas as abas de linhas de um projeto numa resposta so.

    Serve para a tela Consultar e para montar o relatorio sem sete
    requisicoes. Somente leitura; para gravar, use a rota de cada aba.
    """

    def get(self, request, projeto_id):
        projeto = self.get_projeto()
        contexto = {'request': request, 'projeto': projeto}
        resposta = {}
        for chave, viewset, related_name in ABAS:
            linhas = (
                getattr(projeto, related_name)
                .select_related(*viewset.select_related)
                .all()
            )
            resposta[chave] = viewset.serializer_class(
                linhas, many=True, context=contexto).data
        return Response(resposta)





class ProjetoViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated] #dev: AllowAny | prod: IsAuthenticated

    def get_queryset(self):
        return (
            projetos_visiveis_para(self.request.user) #dev: Projeto.objects.all() | prod: projetos_visiveis_para(self.request.user)
            .select_related('coordenador__pessoa', 'unidade_proponente', 'endereco',
'caracterizacao', 'descricao')
            .prefetch_related('contatos')
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjetoResumoSerializer
        return ProjetoDetalheSimplesSerializer

    def perform_create(self, serializer):
        projeto = serializer.save()

        ProjetoEndereco.objects.get_or_create(projeto=projeto)
        ProjetoCaracterizacao.objects.get_or_create(projeto=projeto)
        ProjetoDescricao.objects.get_or_create(projeto=projeto)

    # --- endpoint para cada "Salvar" de aba simples ---

    @action(detail=True, methods=['get', 'put', 'patch'])
    def caracterizacao(self, request, pk=None):
        projeto = self.get_object()
        carac, _ = ProjetoCaracterizacao.objects.get_or_create(projeto=projeto)

        if request.method == 'GET':
            return Response(ProjetoCaracterizacaoSerializer(carac).data)

        serializer = ProjetoCaracterizacaoSerializer(carac, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'put', 'patch'])
    def descricao(self, request, pk=None):
        projeto = self.get_object()
        desc, _ = ProjetoDescricao.objects.get_or_create(projeto=projeto)

        if request.method == 'GET':
            return Response(ProjetoDescricaoSerializer(desc).data)

        serializer = ProjetoDescricaoSerializer(desc, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'put', 'patch'])
    def endereco(self, request, pk=None):
        projeto = self.get_object()
        endereco, _ = ProjetoEndereco.objects.get_or_create(projeto=projeto)

        if request.method == 'GET':
            return Response(ProjetoEnderecoSerializer(endereco).data)

        serializer = ProjetoEnderecoSerializer(endereco, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    @action(detail=True, methods=['get', 'post'])
    def contatos(self, request, pk=None):
        projeto = self.get_object()
        if request.method == 'GET':
            return Response(ProjetoContatoSerializer(projeto.contatos.all(), many=True).data)

        serializer = ProjetoContatoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(projeto=projeto)
        return Response(serializer.data, status=status.HTTP_201_CREATED)