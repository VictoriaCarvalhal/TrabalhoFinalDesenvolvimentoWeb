import uuid

from django.db.models import Q

from projetos.models import Projeto


def projetos_visiveis_para(user):
    """Projetos que o usuario logado pode abrir: so os que ele coordena.

    E o unico lugar que sabe como ligar o usuario da sessao ao coordenador.
    Quando a autenticacao entrar na main, se o usuario for a propria
    PessoaGlobal a comparacao e por chave; se for o User padrao do Django a
    ligacao e pelo e-mail institucional. Staff e superusuario enxergam tudo,
    para dar para testar pelo admin.
    """
    qs = Projeto.objects.all()
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return qs

    filtros = Q(pk__in=[])
    if isinstance(user.pk, uuid.UUID):
        filtros |= Q(coordenador__pessoa_id=user.pk)
    email = getattr(user, 'email_institucional', None) or getattr(user, 'email', None)
    if email:
        filtros |= Q(coordenador__pessoa__email_institucional__iexact=email)
    return qs.filter(filtros)
