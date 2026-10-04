from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # O include do core.urls já cobre /api/v1/auth/login/ com o CustomTokenObtainPairView
    path("api/v1/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    path("api/v1/", include("core.urls")),
    path("api/v1/", include("projetos.urls")),
    
    # Documentação Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
