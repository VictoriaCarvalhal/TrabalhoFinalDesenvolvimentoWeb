from django.urls import path
from core.views import RegisterView, PerfilView, MunicipioIBGEListView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', PerfilView.as_view(), name='auth_me'),
]


urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', PerfilView.as_view(), name='auth_me'),
    path('municipios/', MunicipioIBGEListView.as_view(), name='municipios_list'),
]
