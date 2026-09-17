

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AreaTematica',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descricao', models.CharField(max_length=255, unique=True)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Área Temática',
                'verbose_name_plural': 'Áreas Temáticas',
                'ordering': ['descricao'],
            },
        ),
        migrations.CreateModel(
            name='LinhaExtensao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descricao', models.CharField(max_length=255, unique=True)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Linha de Extensão',
                'verbose_name_plural': 'Linhas de Extensão',
                'ordering': ['descricao'],
            },
        ),
        migrations.CreateModel(
            name='MunicipioIBGE',
            fields=[
                ('codigo_ibge', models.IntegerField(primary_key=True, serialize=False)),
                ('nome', models.CharField(max_length=255)),
                ('uf', models.CharField(db_index=True, max_length=2)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Município IBGE',
                'verbose_name_plural': 'Municípios IBGE',
                'ordering': ['uf', 'nome'],
            },
        ),
        migrations.CreateModel(
            name='NaturezaExtensao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descricao', models.CharField(max_length=100, unique=True)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Natureza de Extensão',
                'verbose_name_plural': 'Naturezas de Extensão',
                'ordering': ['descricao'],
            },
        ),
        migrations.CreateModel(
            name='PessoaGlobal',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nome_completo', models.CharField(max_length=255)),
                ('cpf', models.CharField(max_length=11, unique=True)),
                ('email_institucional', models.EmailField(blank=True, max_length=254, null=True, unique=True)),
                ('lattes_url', models.URLField(blank=True, max_length=255)),
            ],
            options={
                'verbose_name': 'Pessoa',
                'verbose_name_plural': 'Pessoas',
                'ordering': ['nome_completo'],
            },
        ),
        migrations.CreateModel(
            name='UnidadeAcademica',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sigla', models.CharField(max_length=10, unique=True)),
                ('nome', models.CharField(max_length=255)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Unidade Acadêmica',
                'verbose_name_plural': 'Unidades Acadêmicas',
                'ordering': ['sigla'],
            },
        ),
        migrations.CreateModel(
            name='Departamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=255)),
                ('ativo', models.BooleanField(default=True)),
                ('unidade', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='departamentos', to='core.unidadeacademica')),
            ],
            options={
                'ordering': ['nome'],
            },
        ),
        migrations.CreateModel(
            name='VinculoInstitucional',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tipo_vinculo', models.CharField(choices=[('PROFESSOR_TITULAR', 'Professor(a) Titular'), ('PROFESSOR_ADJUNTO', 'Professor(a) Adjunto'), ('PROFESSOR_ASSOCIADO', 'Professor(a) Associado'), ('TECNICO_ADMINISTRATIVO', 'Técnico(a) Administrativo'), ('ALUNO_GRADUACAO', 'Aluno(a) de Graduação'), ('ALUNO_POS_GRADUACAO', 'Aluno(a) de Pós-Graduação'), ('EXTERNO', 'Externo')], max_length=25)),
                ('matricula', models.CharField(blank=True, max_length=50)),
                ('status', models.CharField(choices=[('ATIVO', 'Ativo'), ('INATIVO', 'Inativo'), ('EGRESSO', 'Egresso'), ('AFASTADO', 'Afastado')], db_index=True, default='ATIVO', max_length=10)),
                ('departamento', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='vinculos', to='core.departamento')),
                ('pessoa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vinculos', to='core.pessoaglobal')),
            ],
            options={
                'verbose_name': 'Vínculo Institucional',
                'verbose_name_plural': 'Vínculos Institucionais',
                'ordering': ['pessoa__nome_completo'],
            },
        ),
        migrations.CreateModel(
            name='AreaConhecimentoCNPq',
            fields=[
                ('codigo', models.IntegerField(primary_key=True, serialize=False)),
                ('descricao', models.CharField(max_length=255)),
                ('nivel', models.PositiveSmallIntegerField(choices=[(1, 'Grande Área'), (2, 'Área'), (3, 'Subárea')])),
                ('ativo', models.BooleanField(default=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sub_areas', to='core.areaconhecimentocnpq')),
            ],
            options={
                'verbose_name': 'Área de Conhecimento CNPq',
                'verbose_name_plural': 'Áreas de Conhecimento CNPq',
                'ordering': ['codigo'],
                'indexes': [models.Index(fields=['parent'], name='core_areaco_parent__5d51b9_idx'), models.Index(fields=['nivel'], name='core_areaco_nivel_413d17_idx')],
            },
        ),
        migrations.AddIndex(
            model_name='departamento',
            index=models.Index(fields=['unidade'], name='core_depart_unidade_74f83e_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='vinculoinstitucional',
            unique_together={('pessoa', 'tipo_vinculo', 'matricula')},
        ),
    ]
