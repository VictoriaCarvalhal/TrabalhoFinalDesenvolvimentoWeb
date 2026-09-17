from django.urls import path
from core.views import RegisterView, PerfilView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', PerfilView.as_view(), name='auth_me'),
]
