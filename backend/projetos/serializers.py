from rest_framework import serializers
from core.models import UnidadeAcademica, Departamento
from projetos.models import ParceriaInterna, ParceriaExterna
from projetos.models import LocalRealizacao

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
