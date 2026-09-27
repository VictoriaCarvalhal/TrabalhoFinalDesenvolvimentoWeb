from django.contrib import admin

from .models import *


@admin.register(UnidadeAcademica)
class UnidadeAcademicaAdmin(admin.ModelAdmin):
    list_display = ('sigla', 'nome', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('sigla', 'nome')


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'unidade', 'ativo')
    list_filter = ('unidade', 'ativo')
    search_fields = ('nome', 'unidade__sigla', 'unidade__nome')


@admin.register(MunicipioIBGE)
class MunicipioIBGEAdmin(admin.ModelAdmin):
    list_display = ('codigo_ibge', 'nome', 'uf', 'ativo')
    list_filter = ('uf', 'ativo')
    search_fields = ('nome', 'uf', 'codigo_ibge')


@admin.register(NaturezaExtensao)
class NaturezaExtensaoAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('descricao',)


@admin.register(LinhaExtensao)
class LinhaExtensaoAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('descricao',)


@admin.register(AreaTematica)
class AreaTematicaAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('descricao',)


@admin.register(AreaConhecimentoCNPq)
class AreaConhecimentoCNPqAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'descricao', 'nivel', 'parent', 'ativo')
    list_filter = ('nivel', 'ativo')
    search_fields = ('codigo', 'descricao')
    autocomplete_fields = ('parent',)


@admin.register(PessoaGlobal)
class PessoaGlobalAdmin(admin.ModelAdmin):
    list_display = (
        'nome_completo',
        'cpf',
        'email_institucional',
        'is_active',
        'is_staff',
    )
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = (
        'nome_completo',
        'cpf',
        'email_institucional',
    )
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(VinculoInstitucional)
class VinculoInstitucionalAdmin(admin.ModelAdmin):
    list_display = (
        'pessoa',
        'tipo_vinculo',
        'matricula',
        'departamento',
        'status',
        'created_at',
    )
    list_filter = (
        'tipo_vinculo',
        'status',
        'departamento__unidade',
    )
    search_fields = (
        'pessoa__nome_completo',
        'pessoa__cpf',
        'matricula',
        'departamento__nome',
    )
    autocomplete_fields = (
        'pessoa',
        'departamento',
    )
    readonly_fields = ('id', 'created_at', 'updated_at')