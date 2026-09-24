from django.urls import path
from rest_framework.routers import SimpleRouter

from projetos import views

# O <projeto_id> entra no prefixo de cada rota; o router aceita regex e
# repassa o grupo como kwarg para a view.
PROJETO = r'projetos/(?P<projeto_id>[0-9a-f-]{36})'

router = SimpleRouter()
router.register(r'projetos', views.ProjetoViewSet, basename='projeto')
router.register(f'{PROJETO}/unidades-envolvidas', views.UnidadeEnvolvidaViewSet, basename='unidade-envolvida')
router.register(f'{PROJETO}/locais-realizacao', views.LocalRealizacaoViewSet, basename='local-realizacao')
router.register(f'{PROJETO}/parcerias-internas', views.ParceriaInternaViewSet, basename='parceria-interna')
router.register(f'{PROJETO}/parcerias-externas', views.ParceriaExternaViewSet, basename='parceria-externa')
router.register(f'{PROJETO}/membros-equipe', views.MembroEquipeViewSet, basename='membro-equipe')
router.register(f'{PROJETO}/demandas-bolsa', views.DemandaBolsaViewSet, basename='demanda-bolsa')
router.register(f'{PROJETO}/planos-trabalho', views.PlanoTrabalhoViewSet, basename='plano-trabalho')

urlpatterns = [
    path('projetos/<uuid:projeto_id>/abas/', views.AbasDoProjetoView.as_view(), name='projeto-abas'),
]
urlpatterns += router.urls
