import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-TROQUE-ESTA-CHAVE-EM-PRODUCAO",
)

DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

AUTH_USER_MODEL = "core.PessoaGlobal"

CORS_ALLOWED_ORIGINS = [
    origem.strip() 
    for origem in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") 
    if origem.strip()
]
if DEBUG:
    CORS_ALLOWED_ORIGINS.extend([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ])

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "rest_framework",
    "rest_framework_simplejwt",
    'rest_framework_simplejwt.token_blacklist',
    "drf_spectacular",
    "corsheaders",
    "core",
    "projetos",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get("DATABASE_URL"),
    )
}

DATABASES["default"]["OPTIONS"] = {
    "options": "-c search_path=public",
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_RATES": {
        "password_reset": "5/hour",
        "primeiro_acesso": "10/hour",
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15), #Deixo aqui meu honesto pedido de desculpas para o pessoal do backend, att, Aprigio
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),                                            #Garanto que depois eu volto aqui, desfaço e arrumo uma solução no front, isso é só pra testar as requisições do frontend
    'ROTATE_REFRESH_TOKENS': True,
    # --- ALTERADO: Invalida o Refresh Token anterior colocando na blacklist ---
    'BLACKLIST_AFTER_ROTATION': True,                                                       #Como demonstração de boa fé ajustei esse bugzin aqui, tmj.  BLACK_LIST_AFTER_ROTATION -> BLACKLIST_AFTER_ROTATION
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

SPECTACULAR_SETTINGS = {
    "TITLE": "API Projetos de Extensão",
    'DESCRIPTION': 'Documentação dos endpoints de autenticação, domínios e usuários.',
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
    },
}

CORS_ALLOW_ALL_ORIGINS = DEBUG

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- BYPASS TEMPORÁRIO DE AUTENTICAÇÃO (APENAS DEV) ---
# if DEBUG:
#    from rest_framework import authentication
#    from django.contrib.auth import get_user_model
#    class DevForceAuth(authentication.BaseAuthentication):
#        def authenticate(self, request):
#            User = get_user_model()
#            # Pega o primeiro superusuário ou o primeiro usuário do banco
#            user = User.objects.filter(is_superuser=True).first() or User.objects.first()
#            return (user, None)
#    REST_FRAMEWORK = globals().get('REST_FRAMEWORK', {})
#    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [
#        # Foi alterado de 'seu_projeto.settings...' para 'config.settings...'
#        'config.settings.DevForceAuth', 
#    ]
#    REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [
#        'rest_framework.permissions.AllowAny',
#    ]

# Recuperacao de senha
FRONTEND_URL = os.environ.get(
    'FRONTEND_URL',
    'http://localhost:5173'
)

PASSWORD_RESET_TIMEOUT = 1800

EMAIL_HOST = os.environ.get('EMAIL_HOST', '')

# Com servidor de e-mail configurado o envio e de verdade. Sem ele, cai no
# console, que no Vercel significa que o e-mail fica no log e ninguem recebe.
EMAIL_CONFIGURADO = bool(EMAIL_HOST)

EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.smtp.EmailBackend' if EMAIL_CONFIGURADO
    else 'django.core.mail.backends.console.EmailBackend'
)


def _email_port():
    try:
        return int(os.environ.get('EMAIL_PORT', '') or 587)
    except (TypeError, ValueError):
        return 587


EMAIL_PORT = _email_port()
EMAIL_USE_TLS = os.environ.get(
    'EMAIL_USE_TLS',
    'True'
).lower() in ('true', '1', 'yes')

EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

DEFAULT_FROM_EMAIL = os.environ.get(
    'DEFAULT_FROM_EMAIL',
    EMAIL_HOST_USER or 'no-reply@localhost'
)
