

import django.contrib.postgres.fields
import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Projeto',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('ano', models.PositiveSmallIntegerField(db_index=True)),
                ('numero', models.PositiveIntegerField(blank=True, null=True)),
                ('titulo', models.CharField(max_length=255)),
                ('situacao', models.CharField(choices=[('RASCUNHO', 'Rascunho'), ('SUBMETIDO', 'Submetido'), ('EM_ANALISE', 'Em Análise'), ('APROVADO', 'Aprovado'), ('REJEITADO', 'Rejeitado'), ('EM_EXECUCAO', 'Em Execução'), ('CONCLUIDO', 'Concluído'), ('CANCELADO', 'Cancelado')], db_index=True, default='RASCUNHO', max_length=20)),
                ('coordenador', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='projetos_coordenados', to='core.vinculoinstitucional')),
                ('departamento_proponente', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='projetos_propostos', to='core.departamento')),
                ('unidade_proponente', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='projetos_propostos', to='core.unidadeacademica')),
            ],
            options={
                'ordering': ['-ano', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ParceriaInterna',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nome_contato', models.CharField(blank=True, max_length=255)),
                ('descricao_contribuicao', models.TextField(blank=True)),
                ('formalizado_convenio', models.BooleanField(default=False)),
                ('departamento', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='parcerias_internas', to='core.departamento')),
                ('unidade', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='parcerias_internas', to='core.unidadeacademica')),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parcerias_internas', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Parceria Interna',
                'verbose_name_plural': 'Parcerias Internas',
                'ordering': ['unidade__sigla'],
            },
        ),
        migrations.CreateModel(
            name='ParceriaExterna',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nome_instituicao', models.CharField(max_length=255)),
                ('cnpj', models.CharField(blank=True, max_length=14)),
                ('tipo_instituicao', models.CharField(choices=[('PUBLICA', 'Pública'), ('PRIVADA', 'Privada'), ('ONG', 'ONG / Terceiro Setor'), ('ORGANISMO_INTERNACIONAL', 'Organismo Internacional'), ('OUTRO', 'Outro')], max_length=25)),
                ('nome_contato', models.CharField(blank=True, max_length=255)),
                ('descricao_contribuicao', models.TextField(blank=True)),
                ('formalizado_convenio', models.BooleanField(default=False)),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parcerias_externas', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Parceria Externa',
                'verbose_name_plural': 'Parcerias Externas',
                'ordering': ['nome_instituicao'],
            },
        ),
        migrations.CreateModel(
            name='LocalRealizacao',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nome_local', models.CharField(max_length=255)),
                ('endereco_completo', models.CharField(blank=True, max_length=500)),
                ('municipio', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='core.municipioibge')),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='locais_realizacao', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Local de Realização',
                'verbose_name_plural': 'Locais de Realização',
                'ordering': ['nome_local'],
            },
        ),
        migrations.CreateModel(
            name='ProjetoCaracterizacao',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('situacao_academica', models.CharField(blank=True, choices=[('NOVO', 'Novo'), ('RENOVACAO', 'Renovação'), ('REESTRUTURACAO', 'Reestruturação')], max_length=20)),
                ('vinculado_programa_extensao', models.BooleanField(default=False)),
                ('curricularizado', models.BooleanField(default=False)),
                ('abrangencia', models.CharField(blank=True, choices=[('LOCAL', 'Local'), ('REGIONAL', 'Regional'), ('NACIONAL', 'Nacional'), ('INTERNACIONAL', 'Internacional')], max_length=15)),
                ('publico_alvo', models.TextField(blank=True)),
                ('area_tematica_principal', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='projetos_principal', to='core.areatematica')),
                ('area_tematica_secundaria', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='projetos_secundaria', to='core.areatematica')),
                ('grande_area_cnpq', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='+', to='core.areaconhecimentocnpq')),
                ('linha_extensao', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='projetos', to='core.linhaextensao')),
                ('natureza', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='projetos', to='core.naturezaextensao')),
                ('projeto', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='caracterizacao', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Caracterização do Projeto',
                'verbose_name_plural': 'Caracterizações dos Projetos',
            },
        ),
        migrations.CreateModel(
            name='ProjetoContato',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tipo_contato', models.CharField(choices=[('EMAIL', 'E-mail'), ('TELEFONE', 'Telefone')], max_length=10)),
                ('valor', models.CharField(max_length=100)),
                ('ddd', models.CharField(blank=True, max_length=3)),
                ('ramal', models.CharField(blank=True, max_length=10)),
                ('tipo_telefone', models.CharField(blank=True, choices=[('CELULAR', 'Celular'), ('COMERCIAL', 'Comercial'), ('RESIDENCIAL', 'Residencial')], max_length=15)),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contatos', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Contato do Projeto',
                'verbose_name_plural': 'Contatos do Projeto',
                'ordering': ['tipo_contato', 'valor'],
            },
        ),
        migrations.CreateModel(
            name='ProjetoDescricao',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('resumo', models.TextField(blank=True)),
                ('palavras_chave', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=150), blank=True, default=list, size=5)),
                ('introducao', models.TextField(blank=True)),
                ('justificativa', models.TextField(blank=True)),
                ('objetivo_geral', models.TextField(blank=True)),
                ('objetivos_especificos', models.TextField(blank=True)),
                ('metodologia_avaliacao', models.TextField(blank=True)),
                ('relacao_ensino', models.BooleanField(default=False)),
                ('relacao_pesquisa', models.BooleanField(default=False)),
                ('interacao_dialogica', models.TextField(blank=True)),
                ('interdisciplinaridade', models.TextField(blank=True)),
                ('impacto_formacao', models.TextField(blank=True)),
                ('indissociabilidade', models.TextField(blank=True)),
                ('impacto_social', models.TextField(blank=True)),
                ('referencias_bibliograficas', models.TextField(blank=True)),
                ('projeto', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='descricao', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Descrição do Projeto',
                'verbose_name_plural': 'Descrições dos Projetos',
            },
        ),
        migrations.CreateModel(
            name='ProjetoEndereco',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('logradouro', models.CharField(blank=True, max_length=255)),
                ('numero', models.CharField(blank=True, max_length=20)),
                ('complemento', models.CharField(blank=True, max_length=100)),
                ('bairro', models.CharField(blank=True, max_length=100)),
                ('cep', models.CharField(blank=True, max_length=9)),
                ('municipio', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='+', to='core.municipioibge')),
                ('projeto', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='endereco', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Endereço do Projeto',
                'verbose_name_plural': 'Endereços dos Projetos',
            },
        ),
        migrations.CreateModel(
            name='ProjetoUnidade',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tipo_participacao', models.CharField(choices=[('PROPONENTE', 'Proponente'), ('EXECUTORA', 'Executora'), ('APOIADORA', 'Apoiadora')], default='APOIADORA', max_length=15)),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='projeto_unidades', to='projetos.projeto')),
                ('unidade', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='unidade_projetos', to='core.unidadeacademica')),
            ],
            options={
                'verbose_name': 'Unidade Envolvida',
                'verbose_name_plural': 'Unidades Envolvidas',
                'ordering': ['tipo_participacao'],
                'unique_together': {('projeto', 'unidade')},
            },
        ),
        migrations.AddField(
            model_name='projeto',
            name='unidades_envolvidas',
            field=models.ManyToManyField(blank=True, related_name='projetos_envolvidos', through='projetos.ProjetoUnidade', to='core.unidadeacademica'),
        ),
        migrations.CreateModel(
            name='PlanoTrabalho',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('ano', models.PositiveSmallIntegerField()),
                ('resultados_esperados', models.TextField(blank=True)),
                ('cronograma_atividades', models.TextField(blank=True)),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='planos_trabalho', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Plano de Trabalho',
                'verbose_name_plural': 'Planos de Trabalho',
                'ordering': ['projeto', 'ano'],
                'unique_together': {('projeto', 'ano')},
            },
        ),
        migrations.CreateModel(
            name='MembroEquipe',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('funcao', models.CharField(choices=[('COORDENADOR', 'Coordenador(a)'), ('VICE_COORDENADOR', 'Vice-Coordenador(a)'), ('DOCENTE_COLABORADOR', 'Docente Colaborador(a)'), ('TECNICO', 'Técnico(a)'), ('BOLSISTA', 'Bolsista'), ('VOLUNTARIO', 'Voluntário(a)'), ('DISCENTE', 'Discente')], max_length=20)),
                ('carga_horaria_semanal', models.PositiveSmallIntegerField(default=0)),
                ('data_entrada', models.DateField(blank=True, null=True)),
                ('data_saida', models.DateField(blank=True, null=True)),
                ('vinculo', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='participacoes_projeto', to='core.vinculoinstitucional')),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='membros', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Membro da Equipe',
                'verbose_name_plural': 'Membros da Equipe',
                'ordering': ['funcao', 'vinculo__pessoa__nome_completo'],
                'unique_together': {('projeto', 'vinculo')},
            },
        ),
        migrations.CreateModel(
            name='DemandaBolsa',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tipo_bolsa', models.CharField(choices=[('IC', 'Iniciação Científica'), ('EXTENSAO', 'Extensão'), ('MONITORIA', 'Monitoria'), ('PIBID', 'PIBID'), ('RESIDENCIA', 'Residência'), ('OUTRO', 'Outro')], max_length=15)),
                ('quantidade', models.PositiveSmallIntegerField(default=1)),
                ('justificativa', models.TextField(blank=True)),
                ('projeto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandas_bolsa', to='projetos.projeto')),
            ],
            options={
                'verbose_name': 'Demanda de Bolsa',
                'verbose_name_plural': 'Demandas de Bolsa',
                'ordering': ['tipo_bolsa'],
                'unique_together': {('projeto', 'tipo_bolsa')},
            },
        ),
        migrations.AddIndex(
            model_name='projeto',
            index=models.Index(fields=['ano', 'situacao'], name='projetos_pr_ano_c8a5c9_idx'),
        ),
    ]
