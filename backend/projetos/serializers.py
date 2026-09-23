from rest_framework import serializers
from core.models import UnidadeAcademica, Departamento
from projetos.models import ParceriaInterna, ParceriaExterna
from projetos.models import LocalRealizacao
from core.models import PessoaGlobal, VinculoInstitucional
from core.serializers import validar_cpf
from projetos.models import MembroEquipe, FuncaoMembroEquipe

class ParceriaInternaSerializer(serializers.ModelSerializer):
    # Traz a sigla e o nome da unidade/departamento formatados na leitura
    unidade_nome = serializers.ReadOnlyField(source='unidade.nome')
    unidade_sigla = serializers.ReadOnlyField(source='unidade.sigla')
    departamento_nome = serializers.ReadOnlyField(source='departamento.nome', default=None)

    class Meta:
        model = ParceriaInterna
        fields = [
            'id',
            'projeto',
            'nome_instituicao',
            'sigla_instituicao',
            'unidade',
            'unidade_nome',
            'unidade_sigla',
            'departamento',
            'departamento_nome',
            'participacao',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at' 
        ]

    def validate(self, attrs):
        # Valida se o departamento pertence a unidade
        unidade = attrs.get('unidade') or (self.instance.unidade if self.instance else None)
        departamento = attrs.get('departamento')

        if departamento and unidade and departamento.unidade != unidade:
            raise serializers.ValidationError({
                'departamento': f'O departamento "{departamento.nome}" não pertence a unidade "{unidade.sigla}".'
            })
        return attrs

class ParceriaExternaSerializer(serializers.ModelSerializer):
    tipo_instituicao_display = serializers.CharField(source='get_tipo_instituicao_display', read_only=True)

    class Meta:
        model = ParceriaExterna
        fields = [
            'id',
            'projeto',
            'nome_instituicao',
            'sigla_instituicao',
            'tipo_instituicao',
            'tipo_instituicao_display',
            'participacao',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at' 
        ]

class LocalRealizacaoSerializer(serializers.ModelSerializer):
    # Traz o nome e UF do município formatados para facilitar a leitura no Front-end
    municipio_nome = serializers.ReadOnlyField(source='municipio.nome')
    municipio_uf = serializers.ReadOnlyField(source='municipio.uf')

    class Meta:
        model = LocalRealizacao
        fields = [
            'id',
            'projeto',
            'nome_local',         # Representa a "Instituição" / Nome do local
            'municipio',          # ID do município (Código IBGE recebido no POST)
            'municipio_nome',     # Nome do município (retornado no GET)
            'municipio_uf',       # UF do município (retornado no GET)
            'endereco_completo',  # Opcional
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]

class MembroEquipeSerializer(serializers.ModelSerializer):
    # Campos virtuais de escrita (recebidos no POST)
    cpf = serializers.CharField(write_only=True)
    nome = serializers.CharField(write_only=True)
    matricula = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    tipo_vinculo = serializers.ChoiceField(choices=VinculoInstitucional.TipoVinculo.choices, write_only=True)

    # Campos de leitura formatados para o GET (front-end)
    cpf_display = serializers.ReadOnlyField(source='vinculo.pessoa.cpf')
    nome_display = serializers.ReadOnlyField(source='vinculo.pessoa.nome_completo')
    matricula_display = serializers.ReadOnlyField(source='vinculo.matricula')
    tipo_vinculo_display = serializers.ReadOnlyField(source='vinculo.get_tipo_vinculo_display')
    funcao_display = serializers.CharField(source='get_funcao_display', read_only=True)

    class Meta:
        model = MembroEquipe
        fields = [
            'id',
            'projeto',
            'funcao',                 # Cargo / Perfil (ex: BOLSISTA, VOLUNTARIO, COORDENADOR...)
            'funcao_display',
            'cpf',                    # Write-only
            'nome',                   # Write-only
            'matricula',              # Write-only
            'tipo_vinculo',           # Write-only
            'cpf_display',            # Read-only
            'nome_display',           # Read-only
            'matricula_display',      # Read-only
            'tipo_vinculo_display',   # Read-only
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_cpf(self, value):
        return validar_cpf(value)

    def create(self, validated_data):
        # Extrai os dados do formulário plano
        cpf = validated_data.pop('cpf')
        nome = validated_data.pop('nome')
        matricula = validated_data.pop('matricula', '')
        tipo_vinculo = validated_data.pop('tipo_vinculo')

        # 1. Busca ou cria a Pessoa pelo CPF
        pessoa, _ = PessoaGlobal.objects.get_or_create(
            cpf=cpf,
            defaults={'nome_completo': nome}
        )

        # 2. Busca ou cria o Vínculo Institucional
        vinculo, _ = VinculoInstitucional.objects.get_or_create(
            pessoa=pessoa,
            tipo_vinculo=tipo_vinculo,
            matricula=matricula
        )

        # 3. Cria o Membro da Equipe no Projeto
        membro = MembroEquipe.objects.create(vinculo=vinculo, **validated_data)
        return membro
