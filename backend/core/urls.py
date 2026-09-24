from django.urls import path
from rest_framework.routers import SimpleRouter
from core import views

router = SimpleRouter()
router.register('dominios/unidades', views.UnidadeAcademicaViewSet, basename='unidade')
router.register('dominios/departamentos', views.DepartamentoViewSet, basename='departamento')
router.register('dominios/municipios', views.MunicipioIBGEViewSet, basename='municipio')
router.register('dominios/naturezas', views.NaturezaExtensaoViewSet, basename='natureza')
router.register('dominios/linhas-extensao', views.LinhaExtensaoViewSet, basename='linha-extensao')
router.register('dominios/areas-tematicas', views.AreaTematicaViewSet, basename='area-tematica')
router.register('dominios/areas-cnpq', views.AreaConhecimentoCNPqViewSet, basename='area-cnpq')
router.register('dominios/vinculos', views.VinculoInstitucionalViewSet, basename='vinculo')


urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='auth_register'),
    path('auth/me/', views.PerfilView.as_view(), name='auth_me'),
    path('auth/session/', views.SessionCheckView.as_view(), name='auth_session_check'),
]

urlpatterns += router.urls
