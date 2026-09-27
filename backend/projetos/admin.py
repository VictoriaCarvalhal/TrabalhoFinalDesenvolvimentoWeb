from django.contrib import admin

from .models import *

class ProjetoEnderecoInline(admin.StackedInline):
    model = ProjetoEndereco
    extra = 0
    max_num = 1

class ProjetoCaracterizacaoInline(admin.StackedInline):
    model = ProjetoCaracterizacao
    extra = 0
    max_num = 1

class ProjetoDescricaoInline(admin.StackedInline):
    model = ProjetoDescricao
    extra = 0
    max_num = 1

class ProjetoContatoInline(admin.TabularInline):
    model = ProjetoContato
    extra = 0

class PlanoTrabalhoInline(admin.StackedInline):
    model = PlanoTrabalho
    extra = 0

class DemandaBolsaInline(admin.StackedInline):
    model = DemandaBolsa
    extra = 0

class ProjetoUnidadeInline(admin.TabularInline):
    model = ProjetoUnidade
    extra = 0

class LocalRealizacaoInline(admin.StackedInline):
    model = LocalRealizacao
    extra = 0

class ParceriaInternaInline(admin.StackedInline):
    model = ParceriaInterna
    extra = 0

class ParceriaExternaInline(admin.StackedInline):
    model = ParceriaExterna
    extra = 0

class MembroEquipeInline(admin.TabularInline):
    model = MembroEquipe
    extra = 0


@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = (
        'ano',
        'numero',
        'titulo',
        'situacao',
        'coordenador',
        'unidade_proponente',
        'created_at',
    )

    list_filter = (
        'ano',
        'situacao',
        'unidade_proponente',
    )

    search_fields = (
        'titulo',
        'coordenador__pessoa__nome_completo',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )

    autocomplete_fields = (
        'coordenador',
        'unidade_proponente',
        'departamento_proponente',
    )

    ordering = (
        '-ano',
        '-created_at',
    )

    inlines = [
        ProjetoEnderecoInline,
        ProjetoCaracterizacaoInline,
        ProjetoDescricaoInline,
        ProjetoContatoInline,
        PlanoTrabalhoInline,
        DemandaBolsaInline,
        ProjetoUnidadeInline,
        LocalRealizacaoInline,
        ParceriaInternaInline,
        ParceriaExternaInline,
        MembroEquipeInline,
    ]

@admin.register(ProjetoEndereco)
class ProjetoEnderecoAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'logradouro',
        'numero',
        'bairro',
        'municipio',
        'cep',
    )

    search_fields = (
        'projeto__titulo',
        'logradouro',
        'bairro',
        'cep',
    )

    autocomplete_fields = (
        'projeto',
        'municipio',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(ProjetoContato)
class ProjetoContatoAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'tipo_contato',
        'valor',
        'ddd',
        'tipo_telefone',
    )

    list_filter = (
        'tipo_contato',
        'tipo_telefone',
    )

    search_fields = (
        'projeto__titulo',
        'valor',
    )

    autocomplete_fields = (
        'projeto',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(ProjetoCaracterizacao)
class ProjetoCaracterizacaoAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'situacao_academica',
        'vinculado_programa_extensao',
        'curricularizado',
        'abrangencia',
        'natureza',
    )

    list_filter = (
        'situacao_academica',
        'vinculado_programa_extensao',
        'curricularizado',
        'abrangencia',
    )

    search_fields = (
        'projeto__titulo',
    )

    autocomplete_fields = (
        'projeto',
        'natureza',
        'grande_area_cnpq',
        'area_tematica_principal',
        'area_tematica_secundaria',
        'linha_extensao',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(ProjetoDescricao)
class ProjetoDescricaoAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'relacao_ensino',
        'relacao_pesquisa',
        'created_at',
    )

    list_filter = (
        'relacao_ensino',
        'relacao_pesquisa',
    )

    search_fields = (
        'projeto__titulo',
        'resumo',
        'introducao',
        'justificativa',
        'objetivo_geral',
    )

    autocomplete_fields = (
        'projeto',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(PlanoTrabalho)
class PlanoTrabalhoAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'ano',
        'created_at',
    )

    list_filter = (
        'ano',
    )

    search_fields = (
        'projeto__titulo',
    )

    autocomplete_fields = (
        'projeto',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(DemandaBolsa)
class DemandaBolsaAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'tipo_bolsa',
        'quantidade',
        'created_at',
    )

    list_filter = (
        'tipo_bolsa',
    )

    search_fields = (
        'projeto__titulo',
    )

    autocomplete_fields = (
        'projeto',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(ProjetoUnidade)
class ProjetoUnidadeAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'unidade',
        'tipo_participacao',
    )

    list_filter = (
        'tipo_participacao',
    )

    search_fields = (
        'projeto__titulo',
        'unidade__nome',
        'unidade__sigla',
    )

    autocomplete_fields = (
        'projeto',
        'unidade',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(LocalRealizacao)
class LocalRealizacaoAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'nome_local',
        'municipio',
    )

    search_fields = (
        'projeto__titulo',
        'nome_local',
        'municipio__nome',
    )

    autocomplete_fields = (
        'projeto',
        'municipio',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(ParceriaInterna)
class ParceriaInternaAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'unidade',
        'departamento',
        'nome_instituicao',
        'sigla_instituicao',
    )

    search_fields = (
        'projeto__titulo',
        'unidade__nome',
        'unidade__sigla',
        'departamento__nome',
        'nome_instituicao',
        'sigla_instituicao',
    )

    autocomplete_fields = (
        'projeto',
        'unidade',
        'departamento',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(ParceriaExterna)
class ParceriaExternaAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'nome_instituicao',
        'sigla_instituicao',
        'tipo_instituicao',
    )

    list_filter = (
        'tipo_instituicao',
    )

    search_fields = (
        'projeto__titulo',
        'nome_instituicao',
        'sigla_instituicao',
    )

    autocomplete_fields = (
        'projeto',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )


@admin.register(MembroEquipe)
class MembroEquipeAdmin(admin.ModelAdmin):
    list_display = (
        'projeto',
        'vinculo',
        'funcao',
        'carga_horaria_semanal',
        'data_entrada',
        'data_saida',
    )

    list_filter = (
        'funcao',
    )

    search_fields = (
        'projeto__titulo',
        'vinculo__pessoa__nome_completo',
    )

    autocomplete_fields = (
        'projeto',
        'vinculo',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )