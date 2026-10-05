import uuid

from django.db.models import Q

from projetos.models import Projeto


def is_admin(user):
    return bool(getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False))


def pode_excluir_projeto(user):
    return is_admin(user)


def periodo_aberto():
    from core.models import PeriodoExtensao
    return PeriodoExtensao.atual().aberto_efetivo()


def pode_escrever_projeto(user):
    return is_admin(user) or periodo_aberto()


def projetos_visiveis_para(user):
    if is_admin(user):
        return Projeto.objects.all()

    qs = Projeto.objects.filter(excluido=False)

    filtros = Q(pk__in=[])
    if isinstance(user.pk, uuid.UUID):
        filtros |= Q(coordenador__pessoa_id=user.pk)
    email = getattr(user, 'email_institucional', None) or getattr(user, 'email', None)
    if email:
        filtros |= Q(coordenador__pessoa__email_institucional__iexact=email)
    return qs.filter(filtros)
