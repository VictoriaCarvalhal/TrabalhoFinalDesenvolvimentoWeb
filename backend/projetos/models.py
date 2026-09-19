import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField

from core.models import (
    AuditModel, UnidadeAcademica, Departamento, MunicipioIBGE,
    NaturezaExtensao, LinhaExtensao, AreaTematica,
    AreaConhecimentoCNPq, VinculoInstitucional,
)


# --- Choices ---

class SituacaoProjeto(models.TextChoices):
    RASCUNHO = 'RASCUNHO', 'Rascunho'
    SUBMETIDO = 'SUBMETIDO', 'Submetido'
    EM_ANALISE = 'EM_ANALISE', 'Em Análise'
    APROVADO = 'APROVADO', 'Aprovado'
    REJEITADO = 'REJEITADO', 'Rejeitado'
    EM_EXECUCAO = 'EM_EXECUCAO', 'Em Execução'
    CONCLUIDO = 'CONCLUIDO', 'Concluído'
    CANCELADO = 'CANCELADO', 'Cancelado'


class TipoContato(models.TextChoices):
    EMAIL = 'EMAIL', 'E-mail'
    TELEFONE = 'TELEFONE', 'Telefone'


class TipoTelefone(models.TextChoices):
    CELULAR = 'CELULAR', 'Celular'
    COMERCIAL = 'COMERCIAL', 'Comercial'
    RESIDENCIAL = 'RESIDENCIAL', 'Residencial'


class Abrangencia(models.TextChoices):
    LOCAL = 'LOCAL', 'Local'
    REGIONAL = 'REGIONAL', 'Regional'
    NACIONAL = 'NACIONAL', 'Nacional'
    INTERNACIONAL = 'INTERNACIONAL', 'Internacional'


class SituacaoProjetoAcademico(models.TextChoices):
    NOVO = 'NOVO', 'Novo'
    RENOVACAO = 'RENOVACAO', 'Renovação'
    REESTRUTURACAO = 'REESTRUTURACAO', 'Reestruturação'


class TipoBolsa(models.TextChoices):
    IC = 'IC', 'Iniciação Científica'
    EXTENSAO = 'EXTENSAO', 'Extensão'
    MONITORIA = 'MONITORIA', 'Monitoria'
    PIBID = 'PIBID', 'PIBID'
    RESIDENCIA = 'RESIDENCIA', 'Residência'
    OUTRO = 'OUTRO', 'Outro'


class TipoParticipacaoUnidade(models.TextChoices):
    PROPONENTE = 'PROPONENTE', 'Proponente'
    EXECUTORA = 'EXECUTORA', 'Executora'
    APOIADORA = 'APOIADORA', 'Apoiadora'


class TipoInstituicaoExterna(models.TextChoices):
    PUBLICA = 'PUBLICA', 'Pública'
    PRIVADA = 'PRIVADA', 'Privada'
    ONG = 'ONG', 'ONG / Terceiro Setor'
    ORGANISMO_INTERNACIONAL = 'ORGANISMO_INTERNACIONAL', 'Organismo Internacional'
    OUTRO = 'OUTRO', 'Outro'


class FuncaoMembroEquipe(models.TextChoices):
    COORDENADOR = 'COORDENADOR', 'Coordenador(a)'
    VICE_COORDENADOR = 'VICE_COORDENADOR', 'Vice-Coordenador(a)'
    DOCENTE_COLABORADOR = 'DOCENTE_COLABORADOR', 'Docente Colaborador(a)'
    TECNICO = 'TECNICO', 'Técnico(a)'
    BOLSISTA = 'BOLSISTA', 'Bolsista'
    VOLUNTARIO = 'VOLUNTARIO', 'Voluntário(a)'
    DISCENTE = 'DISCENTE', 'Discente'


# --- Models ---

class Projeto(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ano = models.PositiveSmallIntegerField(db_index=True)
    numero = models.PositiveIntegerField(null=True, blank=True)
    titulo = models.CharField(max_length=255)
    situacao = models.CharField(
        max_length=20,
        choices=SituacaoProjeto.choices,
        default=SituacaoProjeto.RASCUNHO,
        db_index=True,
    )
    coordenador = models.ForeignKey(
        VinculoInstitucional,
        related_name='projetos_coordenados',
        on_delete=models.PROTECT,
    )
    unidade_proponente = models.ForeignKey(
        UnidadeAcademica,
        null=True, blank=True,
        related_name='projetos_propostos',
        on_delete=models.PROTECT,
    )
    departamento_proponente = models.ForeignKey(
        Departamento,
        null=True, blank=True,
        related_name='projetos_propostos',
        on_delete=models.PROTECT,
    )
    unidades_envolvidas = models.ManyToManyField(
        UnidadeAcademica,
        through='ProjetoUnidade',
        related_name='projetos_envolvidos',
        blank=True,
    )

    class Meta:
        ordering = ['-ano', '-created_at']
        indexes = [
            models.Index(fields=['ano', 'situacao']),
        ]

    def __str__(self):
        return f'{self.ano}/{self.numero or "S/N"} — {self.titulo[:60]}'


class ProjetoEndereco(AuditModel):
    """Endereço de realização do projeto (1:1)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.OneToOneField(Projeto, related_name='endereco', on_delete=models.CASCADE)
    logradouro = models.CharField(max_length=255, blank=True)
    numero = models.CharField(max_length=20, blank=True)
    complemento = models.CharField(max_length=100, blank=True)
    bairro = models.CharField(max_length=100, blank=True)
    municipio = models.ForeignKey(
        MunicipioIBGE, null=True, blank=True,
        related_name='+', on_delete=models.PROTECT,
    )
    cep = models.CharField(max_length=9, blank=True)

    class Meta:
        verbose_name = 'Endereço do Projeto'
        verbose_name_plural = 'Endereços dos Projetos'

    def __str__(self):
        return f'Endereço — {self.projeto.titulo[:40]}'


class ProjetoContato(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='contatos', on_delete=models.CASCADE)
    tipo_contato = models.CharField(max_length=10, choices=TipoContato.choices)
    valor = models.CharField(max_length=100)  # email ou telefone
    ddd = models.CharField(max_length=3, blank=True)
    ramal = models.CharField(max_length=10, blank=True)
    tipo_telefone = models.CharField(max_length=15, choices=TipoTelefone.choices, blank=True)

    class Meta:
        verbose_name = 'Contato do Projeto'
        verbose_name_plural = 'Contatos do Projeto'
        ordering = ['tipo_contato', 'valor']

    def __str__(self):
        return f'{self.get_tipo_contato_display()}: {self.valor}'


class ProjetoCaracterizacao(AuditModel):
    """Classificações e metadados do projeto (1:1)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.OneToOneField(Projeto, related_name='caracterizacao', on_delete=models.CASCADE)
    situacao_academica = models.CharField(max_length=20, choices=SituacaoProjetoAcademico.choices, blank=True)
    vinculado_programa_extensao = models.BooleanField(default=False)
    curricularizado = models.BooleanField(default=False)
    natureza = models.ForeignKey(NaturezaExtensao, null=True, blank=True, related_name='projetos', on_delete=models.PROTECT)
    abrangencia = models.CharField(max_length=15, choices=Abrangencia.choices, blank=True)
    publico_alvo = models.TextField(blank=True)
    grande_area_cnpq = models.ForeignKey(AreaConhecimentoCNPq, null=True, blank=True, related_name='+', on_delete=models.PROTECT)
    area_tematica_principal = models.ForeignKey(AreaTematica, null=True, blank=True, related_name='projetos_principal', on_delete=models.PROTECT)
    area_tematica_secundaria = models.ForeignKey(AreaTematica, null=True, blank=True, related_name='projetos_secundaria', on_delete=models.PROTECT)
    linha_extensao = models.ForeignKey(LinhaExtensao, null=True, blank=True, related_name='projetos', on_delete=models.PROTECT)

    class Meta:
        verbose_name = 'Caracterização do Projeto'
        verbose_name_plural = 'Caracterizações dos Projetos'

    def __str__(self):
        return f'Caracterização — {self.projeto.titulo[:40]}'


class ProjetoDescricao(AuditModel):
    """Textos longos do projeto, separados pra não pesar a listagem (1:1)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.OneToOneField(Projeto, related_name='descricao', on_delete=models.CASCADE)
    resumo = models.TextField(blank=True)
    palavras_chave = ArrayField(models.CharField(max_length=150), size=5, blank=True, default=list)
    introducao = models.TextField(blank=True)
    justificativa = models.TextField(blank=True)
    objetivo_geral = models.TextField(blank=True)
    objetivos_especificos = models.TextField(blank=True)
    metodologia_avaliacao = models.TextField(blank=True)
    relacao_ensino = models.BooleanField(default=False)
    relacao_pesquisa = models.BooleanField(default=False)
    interacao_dialogica = models.TextField(blank=True)
    interdisciplinaridade = models.TextField(blank=True)
    impacto_formacao = models.TextField(blank=True)
    indissociabilidade = models.TextField(blank=True)
    impacto_social = models.TextField(blank=True)
    referencias_bibliograficas = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Descrição do Projeto'
        verbose_name_plural = 'Descrições dos Projetos'

    def __str__(self):
        return f'Descrição — {self.projeto.titulo[:40]}'


class PlanoTrabalho(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='planos_trabalho', on_delete=models.CASCADE)
    ano = models.PositiveSmallIntegerField()
    resultados_esperados = models.TextField(blank=True)
    cronograma_atividades = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Plano de Trabalho'
        verbose_name_plural = 'Planos de Trabalho'
        ordering = ['projeto', 'ano']
        unique_together = [('projeto', 'ano')]

    def __str__(self):
        return f'Plano {self.ano} — {self.projeto.titulo[:40]}'


class DemandaBolsa(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='demandas_bolsa', on_delete=models.CASCADE)
    tipo_bolsa = models.CharField(max_length=15, choices=TipoBolsa.choices)
    quantidade = models.PositiveSmallIntegerField(default=1)
    justificativa = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Demanda de Bolsa'
        verbose_name_plural = 'Demandas de Bolsa'
        ordering = ['tipo_bolsa']
        unique_together = [('projeto', 'tipo_bolsa')]

    def __str__(self):
        return f'{self.get_tipo_bolsa_display()} (x{self.quantidade})'


class ProjetoUnidade(AuditModel):
    """Tabela intermediária do M:N entre Projeto e UnidadeAcademica."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='projeto_unidades', on_delete=models.CASCADE)
    unidade = models.ForeignKey(UnidadeAcademica, related_name='unidade_projetos', on_delete=models.PROTECT)
    tipo_participacao = models.CharField(
        max_length=15,
        choices=TipoParticipacaoUnidade.choices,
        default=TipoParticipacaoUnidade.APOIADORA,
    )

    class Meta:
        verbose_name = 'Unidade Envolvida'
        verbose_name_plural = 'Unidades Envolvidas'
        ordering = ['tipo_participacao']
        unique_together = [('projeto', 'unidade')]

    def __str__(self):
        return f'{self.unidade.sigla} ({self.get_tipo_participacao_display()})'


class LocalRealizacao(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='locais_realizacao', on_delete=models.CASCADE)
    nome_local = models.CharField(max_length=255)
    municipio = models.ForeignKey(MunicipioIBGE, related_name='+', on_delete=models.PROTECT)
    endereco_completo = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = 'Local de Realização'
        verbose_name_plural = 'Locais de Realização'
        ordering = ['nome_local']

    def __str__(self):
        return f'{self.nome_local} — {self.municipio.nome}/{self.municipio.uf}'


class ParceriaInterna(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='parcerias_internas', on_delete=models.CASCADE)
    unidade = models.ForeignKey(UnidadeAcademica, related_name='parcerias_internas', on_delete=models.PROTECT)
    departamento = models.ForeignKey(Departamento, null=True, blank=True, related_name='parcerias_internas', on_delete=models.PROTECT)
    nome_instituicao = models.CharField(max_length=255)
    sigla_instituicao = models.CharField(max_length=50)
    participacao = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = 'Parceria Interna'
        verbose_name_plural = 'Parcerias Internas'
        ordering = ['unidade__sigla']

    def __str__(self):
        return f'Parceria Interna — {self.unidade.sigla}'


class ParceriaExterna(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='parcerias_externas', on_delete=models.CASCADE)
    nome_instituicao = models.CharField(max_length=255)
    sigla_instituicao = models.CharField(max_length=50, blank=True)
    tipo_instituicao = models.CharField(max_length=25, choices=TipoInstituicaoExterna.choices)
    participacao = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = 'Parceria Externa'
        verbose_name_plural = 'Parcerias Externas'
        ordering = ['nome_instituicao']

    def __str__(self):
        return f'Parceria Externa - {self.nome_instituicao}'


class MembroEquipe(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projeto = models.ForeignKey(Projeto, related_name='membros', on_delete=models.CASCADE)
    vinculo = models.ForeignKey(VinculoInstitucional, related_name='participacoes_projeto', on_delete=models.PROTECT)
    funcao = models.CharField(max_length=20, choices=FuncaoMembroEquipe.choices)
    carga_horaria_semanal = models.PositiveSmallIntegerField(default=0)
    data_entrada = models.DateField(null=True, blank=True)
    data_saida = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Membro da Equipe'
        verbose_name_plural = 'Membros da Equipe'
        ordering = ['funcao', 'vinculo__pessoa__nome_completo']
        unique_together = [('projeto', 'vinculo')]

    def __str__(self):
        return f'{self.vinculo.pessoa.nome_completo} — {self.get_funcao_display()}'
