from rest_framework import viewsets, permissions
from projetos.models import ParceriaInterna, ParceriaExterna
from projetos.serializers import ParceriaInternaSerializer, ParceriaExternaSerializer


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
