import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class AuditModel(models.Model):
    """Base com campos de auditoria."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UnidadeAcademica(models.Model):
    sigla = models.CharField(max_length=10, unique=True)
    nome = models.CharField(max_length=255)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Unidade Acadêmica'
        verbose_name_plural = 'Unidades Acadêmicas'
        ordering = ['sigla']

    def __str__(self):
        return f'{self.sigla} - {self.nome}'


class Departamento(models.Model):
    unidade = models.ForeignKey(
        UnidadeAcademica,
        related_name='departamentos',
        on_delete=models.CASCADE,
    )
    nome = models.CharField(max_length=255)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ['nome']
        indexes = [
            models.Index(fields=['unidade']),
        ]

    def __str__(self):
        return f'{self.nome} ({self.unidade.sigla})'


class MunicipioIBGE(models.Model):
    codigo_ibge = models.IntegerField(primary_key=True)
    nome = models.CharField(max_length=255)
    uf = models.CharField(max_length=2, db_index=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Município IBGE'
        verbose_name_plural = 'Municípios IBGE'
        ordering = ['uf', 'nome']

    def __str__(self):
        return f'{self.nome} - {self.uf}'


class NaturezaExtensao(models.Model):
    descricao = models.CharField(max_length=100, unique=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Natureza de Extensão'
        verbose_name_plural = 'Naturezas de Extensão'
        ordering = ['descricao']

    def __str__(self):
        return self.descricao


class LinhaExtensao(models.Model):
    descricao = models.CharField(max_length=255, unique=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Linha de Extensão'
        verbose_name_plural = 'Linhas de Extensão'
        ordering = ['descricao']

    def __str__(self):
        return self.descricao


class AreaTematica(models.Model):
    descricao = models.CharField(max_length=255, unique=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Área Temática'
        verbose_name_plural = 'Áreas Temáticas'
        ordering = ['descricao']

    def __str__(self):
        return self.descricao


class AreaConhecimentoCNPq(models.Model):
    class NivelChoices(models.IntegerChoices):
        GRANDE_AREA = 1, 'Grande Área'
        AREA = 2, 'Área'
        SUBAREA = 3, 'Subárea'

    codigo = models.IntegerField(primary_key=True)
    descricao = models.CharField(max_length=255)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='sub_areas',
        on_delete=models.CASCADE,
    )
    nivel = models.PositiveSmallIntegerField(choices=NivelChoices.choices)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Área de Conhecimento CNPq'
        verbose_name_plural = 'Áreas de Conhecimento CNPq'
        ordering = ['codigo']
        indexes = [
            models.Index(fields=['parent']),
            models.Index(fields=['nivel']),
        ]

    def __str__(self):
        return f'{self.codigo} - {self.descricao}'


class PessoaManager(BaseUserManager):
    def create_user(self, cpf, password=None, **extra):
        user = self.model(cpf=cpf, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user


class PessoaGlobal(AbstractBaseUser, AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome_completo = models.CharField(max_length=255)
    cpf = models.CharField(max_length=11, unique=True)
    email_institucional = models.EmailField(unique=True, blank=True, null=True)
    lattes_url = models.URLField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = PessoaManager()
    USERNAME_FIELD = 'cpf'

    class Meta:
        verbose_name = 'Pessoa'
        verbose_name_plural = 'Pessoas'
        ordering = ['nome_completo']

    def __str__(self):
        return self.nome_completo


class VinculoInstitucional(AuditModel):
    class TipoVinculo(models.TextChoices):
        PROFESSOR_EFETIVO = 'PROFESSOR_EFETIVO', 'Professor Efetivo'
        PROFESSOR_VISITANTE = 'PROFESSOR_VISITANTE', 'Professor Visitante'
        PROFESSOR_SUBSTITUTO = 'PROFESSOR_SUBSTITUTO', 'Professor Substituto/Convidado'
        TECNICO_ADMINISTRATIVO = 'TECNICO_ADMINISTRATIVO', 'Técnico-Administrativo'
        ALUNO_GRADUACAO = 'ALUNO_GRADUACAO', 'Aluno de Graduação Não Bolsista'
        ALUNO_POS_GRADUACAO = 'ALUNO_POS_GRADUACAO', 'Aluno de Pós-Graduação'
        EXTERNO = 'EXTERNO', 'Externo'

    class StatusVinculo(models.TextChoices):
        ATIVO = 'ATIVO', 'Ativo'
        INATIVO = 'INATIVO', 'Inativo'
        EGRESSO = 'EGRESSO', 'Egresso'
        AFASTADO = 'AFASTADO', 'Afastado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pessoa = models.ForeignKey(PessoaGlobal, related_name='vinculos', on_delete=models.CASCADE)
    tipo_vinculo = models.CharField(max_length=25, choices=TipoVinculo.choices)
    matricula = models.CharField(max_length=50, blank=True)
    departamento = models.ForeignKey(
        Departamento,
        null=True,
        blank=True,
        related_name='vinculos',
        on_delete=models.PROTECT,
    )
    status = models.CharField(
        max_length=10,
        choices=StatusVinculo.choices,
        default=StatusVinculo.ATIVO,
        db_index=True,
    )

    class Meta:
        verbose_name = 'Vínculo Institucional'
        verbose_name_plural = 'Vínculos Institucionais'
        ordering = ['pessoa__nome_completo']
        unique_together = [('pessoa', 'tipo_vinculo', 'matricula')]

    def __str__(self):
        return f'{self.pessoa.nome_completo} - {self.get_tipo_vinculo_display()}'
