import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.db.models import Q
from core.models import (
    AreaConhecimentoCNPq, 
    AreaTematica, 
    Departamento,
    LinhaExtensao,
    MunicipioIBGE, 
    NaturezaExtensao,
    PessoaGlobal,
    UnidadeAcademica,
    VinculoInstitucional,
)

def _calcular_digito(digitos: str) -> int:
    pesos = range(len(digitos) + 1, 1, -1)
    soma = sum(int(d) * p for d, p in zip(digitos, pesos))
    return (soma * 10) % 11 % 10

def validar_cpf(cpf: str) -> str:
    """Limpa a pontuação e valida os dígitos verificadores do CPF."""
    cpf_limpo = re.sub(r"\D", "", str(cpf))

    if len(cpf_limpo) != 11 or cpf_limpo == cpf_limpo[0] * 11:
        raise serializers.ValidationError("CPF inválido. Verifique os números digitados.")

    if (
        _calcular_digito(cpf_limpo[:9]) != int(cpf_limpo[9])
        or _calcular_digito(cpf_limpo[:10]) != int(cpf_limpo[10])
    ):
        raise serializers.ValidationError("CPF inválido (dígito verificador incorreto).")

    return cpf_limpo


class RegisterPessoaSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = PessoaGlobal
        fields = [
            'id',
            'nome_completo',
            'cpf',
            'email_institucional',
            'lattes_url',
            'password',
        ]
class EsqueciSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()


class RedefinirSenhaSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    nova_senha = serializers.CharField(write_only=True, min_length=8)
    confirmar_senha = serializers.CharField(write_only=True, min_length=8)

    def validate(self, dados):
        if dados['nova_senha'] != dados['confirmar_senha']:
            raise serializers.ValidationError({
                'confirmar_senha': 'As senhas não são iguais.'
            })

        return dados
    def validate_cpf(self, value):
        return validar_cpf(value)

    def validate_email_institucional(self, value):
        if value:
            return value.strip().lower()
        return value

    def create(self, validated_data):
        return PessoaGlobal.objects.create_user(**validated_data)


class PessoaPerfilSerializer(serializers.ModelSerializer):
    perfil = serializers.SerializerMethodField()

    class Meta:
        model = PessoaGlobal
        fields = [
            'id',
            'nome_completo',
            'cpf',
            'email_institucional',
            'lattes_url',
            'is_staff',
            'is_superuser',
            'perfil',
        ]
        read_only_fields = ['is_staff', 'is_superuser']

    def get_perfil(self, obj):
        if obj.is_superuser or obj.is_staff:
            return 'admin'
        return 'usuario'


class MeuVinculoSerializer(serializers.ModelSerializer):
    tipo_vinculo_display = serializers.CharField(source='get_tipo_vinculo_display', read_only=True)
    nome_completo = serializers.CharField(source='pessoa.nome_completo', read_only=True)

    class Meta:
        model = VinculoInstitucional
        fields = [
            'id', 'pessoa', 'nome_completo',
            'tipo_vinculo', 'tipo_vinculo_display',
            'matricula', 'departamento', 'status',
        ]
        read_only_fields = ['id', 'pessoa', 'status']

    def validate_matricula(self, matricula):
        matricula = (matricula or '').strip()
        if not matricula:
            raise serializers.ValidationError('Informe a matricula.')
        return matricula

    def validate(self, attrs):
        pessoa = self.context['request'].user
        repetido = VinculoInstitucional.objects.filter(
            pessoa=pessoa,
            tipo_vinculo=attrs.get('tipo_vinculo'),
            matricula=attrs.get('matricula'),
        ).exists()
        if repetido:
            raise serializers.ValidationError(
                {'matricula': 'Voce ja tem um vinculo com essa matricula e esse tipo.'})
        return attrs

    def create(self, validated_data):
        return VinculoInstitucional.objects.create(
            pessoa=self.context['request'].user, **validated_data)


class UnidadeAcademicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadeAcademica
        fields = ['id', 'sigla', 'nome']


class DepartamentoSerializer(serializers.ModelSerializer):
    unidade_sigla = serializers.CharField(source='unidade.sigla', read_only=True)

    class Meta:
        model = Departamento
        fields = ['id', 'nome', 'unidade', 'unidade_sigla']   


class MunicipioIBGESerializer(serializers.ModelSerializer):
    class Meta:
        model = MunicipioIBGE
        fields = ['codigo_ibge', 'nome', 'uf']


class NaturezaExtensaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NaturezaExtensao
        fields = ['id', 'descricao']


class LinhaExtensaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinhaExtensao
        fields = ['id', 'descricao']


class AreaTematicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaTematica
        fields = ['id', 'descricao']


class AreaConhecimentoCNPqSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaConhecimentoCNPq
        fields = ['codigo', 'descricao', 'nivel', 'parent']


class VinculoInstitucionalSerializer(serializers.ModelSerializer):
    nome_completo = serializers.CharField(source='pessoa.nome_completo', read_only=True)
    cpf = serializers.CharField(source='pessoa.cpf', read_only=True)
    tipo_vinculo_display = serializers.CharField(source='get_tipo_vinculo_display', read_only=True)

    class Meta:
        model = VinculoInstitucional
        fields = [
            'id', 'pessoa', 'nome_completo', 'cpf',
            'tipo_vinculo', 'tipo_vinculo_display',
            'matricula', 'departamento', 'status',
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customiza a autenticação via JWT para aceitar CPF (com ou sem pontuação) 
    ou Email, ignorando maiúsculas/minúsculas e espaços, e injeta os dados do usuário na resposta.
    """
    def validate(self, attrs):
        username_field = self.username_field
        raw_identifier = attrs.get(username_field, '')

        if raw_identifier:
            identifier = raw_identifier.strip()
            cpf_limpo = re.sub(r"\D", "", identifier)
            
            user = PessoaGlobal.objects.filter(
                Q(cpf=cpf_limpo) | Q(cpf=identifier) | Q(email_institucional__iexact=identifier)
            ).first()

            if user:
                attrs[username_field] = getattr(user, username_field)

        data = super().validate(attrs)

        # Injeta os dados do perfil do usuário na própria resposta do login
        perfil_data = PessoaPerfilSerializer(self.user).data
        data.update({
            'user': perfil_data
        })

        return data
