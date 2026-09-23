"""Entrada do Django na Vercel.

A Vercel procura uma funcao em api/ e uma variavel chamada "app". O codigo
do backend continua todo em backend/, este arquivo so aponta para ele.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application  # noqa: E402

app = get_wsgi_application()
