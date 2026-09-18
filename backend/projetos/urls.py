from django.urls import path

from .views_impressao_mock import ProjetoImpressaoMockView

urlpatterns = [
    path(
        "projetos/<uuid:pk>/impressao/",
        ProjetoImpressaoMockView.as_view(),
        name="projeto-impressao-mock",
    ),
]
