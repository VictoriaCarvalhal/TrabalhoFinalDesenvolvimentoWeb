from projetos.models import TipoInstituicaoExterna
from rest_framework import viewsets, permissions
from projetos.models import ParceriaInterna, ParceriaExterna
from projetos.serializers import ParceriaInternaSerializer, ParceriaExternaSerializer
from projetos.models import LocalRealizacao
from projetos.serializers import LocalRealizacaoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from core.models import VinculoInstitucional
from projetos.models import MembroEquipe, FuncaoMembroEquipe
from projetos.serializers import MembroEquipeSerializer

class ParceriaInternaViewSet(viewsets.ModelViewSet):
    serializer_class = ParceriaInternaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = ParceriaInterna.objects.select_related('unidade', 'departamento', 'projeto').all()
        projeto_id = self.request.query_params.get('projeto')
        if projeto_id:
            queryset = queryset.filter(projeto_id=projeto_id)
        return queryset


class ParceriaExternaViewSet(viewsets.ModelViewSet):
    serializer_class = ParceriaExternaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = ParceriaExterna.objects.select_related('projeto').all()
        projeto_id = self.request.query_params.get('projeto')
        if projeto_id:
            queryset = queryset.filter(projeto_id=projeto_id)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def opcoes_dropdown(self, request):
        """Retorna os tipos de instituição externa para dropdown."""
        tipos_instituicao = [
            {'value': key, 'label': label} for key, label in TipoInstituicaoExterna.choices
        ]
        return Response({'tipos_instituicao': tipos_instituicao})


class LocalRealizacaoViewSet(viewsets.ModelViewSet):
    serializer_class = LocalRealizacaoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Utiliza select_related para otimizar as consultas SQL dos municípios e projetos
        queryset = LocalRealizacao.objects.select_related('municipio', 'projeto').all()
        projeto_id = self.request.query_params.get('projeto')
        if projeto_id:
            queryset = queryset.filter(projeto_id=projeto_id)
        return queryset


class MembroEquipeViewSet(viewsets.ModelViewSet):
    serializer_class = MembroEquipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = MembroEquipe.objects.select_related(
            'vinculo__pessoa', 'vinculo', 'projeto'
        ).all()
        projeto_id = self.request.query_params.get('projeto')
        if projeto_id:
            queryset = queryset.filter(projeto_id=projeto_id)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def opcoes_dropdown(self, request):
        """Endpoint GET /api/v1/membros-equipe/opcoes_dropdown/ para alimentar os dropdowns do front-end."""
        tipos_vinculo = [{'value': key, 'label': label} for key, label in VinculoInstitucional.TipoVinculo.choices]
        cargos_funcoes = [{'value': key, 'label': label} for key, label in FuncaoMembroEquipe.choices]
        return Response({
            'tipos_vinculo': tipos_vinculo,
            'cargos_funcoes': cargos_funcoes
        })
