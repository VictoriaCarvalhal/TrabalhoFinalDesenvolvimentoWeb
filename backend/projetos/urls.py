from django.urls import include, path
from rest_framework.routers import DefaultRouter
from projetos.views import (
    ParceriaInternaViewSet,
    ParceriaExternaViewSet,
    LocalRealizacaoViewSet,
    MembroEquipeViewSet
)

# O Router registra automaticamente as URLs para GET, POST, DELETE etc.

router = DefaultRouter()
router.register(r'parcerias-internas', ParceriaInternaViewSet, basename='parceria-interna')
router.register(r'parcerias-externas', ParceriaExternaViewSet, basename='parceria-externa')
router.register(r'locais-realizacao', LocalRealizacaoViewSet, basename='local-realizacao')
router.register(r'membros-equipe', MembroEquipeViewSet, basename='membro-equipe')

urlpatterns = [
    path('', include(router.urls)),
]
