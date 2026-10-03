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
from rest_framework import permissions, viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from projetos.models import (
    DemandaBolsa, LocalRealizacao, MembroEquipe, ParceriaExterna,
    ParceriaInterna, PlanoTrabalho, ProjetoUnidade,
    ProjetoEndereco, ProjetoCaracterizacao, ProjetoDescricao,
    ProjetoPalavraChave, ProjetoContato, Projeto
)
from core.models import PeriodoExtensao
from projetos.permissions import (
    is_admin, pode_escrever_projeto, pode_excluir_projeto,
    projetos_visiveis_para,
)
from django.db.models import Q
from projetos.serializers import (
    DemandaBolsaSerializer, LocalRealizacaoSerializer, MembroEquipeSerializer,
    ParceriaExternaSerializer, ParceriaInternaSerializer,
    PlanoTrabalhoSerializer, UnidadeEnvolvidaSerializer,
    ProjetoResumoSerializer, ProjetoDetalheSimplesSerializer, ProjetoCreateSerializer,
    ProjetoEnderecoSerializer, ProjetoContatoSerializer,
    ProjetoCaracterizacaoSerializer, ProjetoDescricaoSerializer,
    ProjetoPalavraChaveSerializer
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


def _resposta_periodo_fechado():
    """403 padrão quando um não-admin tenta escrever fora do período."""
    periodo = PeriodoExtensao.atual()
    return Response(
        {
            'detail': periodo.mensagem_fechado
            or 'Fora do período de extensão.',
            'inicio': periodo.inicio,
            'fim': periodo.fim,
            'aberto': False,
        },
        status=status.HTTP_403_FORBIDDEN,
    )


def _escrita_bloqueada(user):
    """True se o usuário não pode criar/editar agora (admin bypassa)."""
    return not pode_escrever_projeto(user)


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

    # Fora do período, não-admin não cria/edita/exclui linhas (admin bypassa).
    def create(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().destroy(request, *args, **kwargs)


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


class PalavraChaveViewSet(AbaDoProjetoViewSet):
    queryset = ProjetoPalavraChave.objects.all()
    serializer_class = ProjetoPalavraChaveSerializer


class ContatoViewSet(AbaDoProjetoViewSet):
    queryset = ProjetoContato.objects.all()
    serializer_class = ProjetoContatoSerializer


# Aba -> (viewset, related_name no Projeto). A ordem e a das abas na tela.
ABAS = [
    ('unidades_envolvidas', UnidadeEnvolvidaViewSet, 'projeto_unidades'),
    ('locais_realizacao', LocalRealizacaoViewSet, 'locais_realizacao'),
    ('parcerias_internas', ParceriaInternaViewSet, 'parcerias_internas'),
    ('parcerias_externas', ParceriaExternaViewSet, 'parcerias_externas'),
    ('membros_equipe', MembroEquipeViewSet, 'membros'),
    ('demandas_bolsa', DemandaBolsaViewSet, 'demandas_bolsa'),
    ('planos_trabalho', PlanoTrabalhoViewSet, 'planos_trabalho'),
    ('palavras_chave', PalavraChaveViewSet, 'palavras_chave'),
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





class ProjetoPagination(PageNumberPagination):
    page_size = 6


class ProjetoViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated] #dev: AllowAny | prod: IsAuthenticated
    pagination_class = ProjetoPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['titulo', 'created_at']
    ordering = ['-created_at', 'titulo']

    def get_queryset(self):
        qs = (
            projetos_visiveis_para(self.request.user) #dev: Projeto.objects.all() | prod: projetos_visiveis_para(self.request.user)
            .select_related('coordenador__pessoa', 'unidade_proponente', 'departamento_proponente', 'endereco',
'caracterizacao', 'descricao')
            .prefetch_related('contatos')
        )

        # Aba da lixeira: ?excluido=true mostra só excluídos, ?excluido=false (default) só ativos.
        # Comum sempre vê só ativos, mesmo se pedir excluido=true.
        excluido_param = (self.request.query_params.get('excluido') or '').strip().lower()
        if is_admin(self.request.user):
            if excluido_param == 'true':
                qs = qs.filter(excluido=True)
            else:
                qs = qs.filter(excluido=False)
        else:
            qs = qs.filter(excluido=False)

        search = self.request.query_params.get('search', '').strip()
        busca_por = self.request.query_params.get('busca_por', 'nome')

        if search:
            if busca_por == 'nome':
                qs = qs.filter(titulo__icontains=search)
            elif busca_por == 'coordenador':
                qs = qs.filter(coordenador__pessoa__nome_completo__icontains=search)
            elif busca_por == 'unidade':
                qs = qs.filter(
                    Q(unidade_proponente__sigla__icontains=search) | 
                    Q(unidade_proponente__nome__icontains=search)
                )
            elif busca_por == 'departamento':
                qs = qs.filter(departamento_proponente__nome__icontains=search)

        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjetoResumoSerializer
        if self.action == 'create':
            return ProjetoCreateSerializer
        return ProjetoDetalheSimplesSerializer

    def perform_create(self, serializer):
        serializer.save()

    # Fora do período, não-admin não cria nem edita (admin bypassa).
    # O destroy/restaurar já são exclusivos de admin, então não entram aqui.
    def create(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Exclusao e exclusiva de admin; comum recebe 403 em qualquer situacao.
        if not pode_excluir_projeto(request.user):
            return Response(
                {'detail': 'Apenas administradores podem excluir projetos.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        instance.excluido = True
        instance.save(update_fields=['excluido', 'updated_at'])

    @action(detail=True, methods=['post'], url_path='restaurar')
    def restaurar(self, request, pk=None):
        # Restaurar e exclusiva de admin, igual a excluir.
        if not pode_excluir_projeto(request.user):
            return Response(
                {'detail': 'Apenas administradores podem restaurar projetos.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        projeto = get_object_or_404(
            projetos_visiveis_para(request.user),
            pk=pk,
        )
        projeto.excluido = False
        projeto.save(update_fields=['excluido', 'updated_at'])
        return Response({'id': projeto.id, 'excluido': False})

    # --- endpoint para cada "Salvar" de aba simples ---

    @action(detail=True, methods=['get', 'put', 'patch'])
    def caracterizacao(self, request, pk=None):
        projeto = self.get_object()
        carac, _ = ProjetoCaracterizacao.objects.get_or_create(projeto=projeto)

        if request.method == 'GET':
            return Response(ProjetoCaracterizacaoSerializer(carac).data)

        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
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

        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
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

        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        serializer = ProjetoEnderecoSerializer(endereco, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    @action(detail=True, methods=['get', 'post'])
    def contatos(self, request, pk=None):
        projeto = self.get_object()
        if request.method == 'GET':
            return Response(ProjetoContatoSerializer(projeto.contatos.all(), many=True).data)

        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        serializer = ProjetoContatoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(projeto=projeto)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['get', 'post'])
    def palavras_chave(self, request, pk=None):
        projeto = self.get_object()
        if request.method == 'GET':
            return Response(ProjetoPalavraChaveSerializer(projeto.palavras_chave.all(), many=True).data)

        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        serializer = ProjetoPalavraChaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(projeto=projeto)
        return Response(serializer.data, status=status.HTTP_201_CREATED)