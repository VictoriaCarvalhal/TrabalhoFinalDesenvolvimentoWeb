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
    ProjetoPalavraChave, ProjetoContato, Projeto, SituacaoProjeto
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
    permission_classes = [permissions.IsAuthenticated]

    def get_projeto(self):
        if not hasattr(self, '_projeto'):
            self._projeto = get_object_or_404(
                projetos_visiveis_para(self.request.user),
                pk=self.kwargs['projeto_id'],
            )
        return self._projeto


def _resposta_periodo_fechado():
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
    return not pode_escrever_projeto(user)


class AbaDoProjetoViewSet(ProjetoDaUrlMixin, viewsets.ModelViewSet):
    pagination_class = None
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
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ProjetoPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['titulo', 'created_at']
    ordering = ['-created_at', 'titulo']

    def get_queryset(self):
        qs = (
            projetos_visiveis_para(self.request.user)
            .select_related('coordenador__pessoa', 'unidade_proponente', 'departamento_proponente', 'endereco',
'caracterizacao', 'descricao')
            .prefetch_related('contatos')
        )

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

    @action(detail=True, methods=['post'], url_path='enviar')
    def enviar(self, request, pk=None):
        if _escrita_bloqueada(request.user):
            return _resposta_periodo_fechado()
        projeto = self.get_object()
        if projeto.situacao != SituacaoProjeto.RASCUNHO:
            return Response(
                {'detail': 'Este projeto ja foi enviado.',
                 'situacao': projeto.situacao},
                status=status.HTTP_409_CONFLICT,
            )
        projeto.situacao = SituacaoProjeto.SUBMETIDO
        projeto.save(update_fields=['situacao', 'updated_at'])
        return Response({
            'id': projeto.id,
            'situacao': projeto.situacao,
            'situacao_display': projeto.get_situacao_display(),
        })

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