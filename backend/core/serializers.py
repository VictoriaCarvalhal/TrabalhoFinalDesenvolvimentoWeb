import re
from rest_framework import serializers
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

    def create(self, validated_data):
        return PessoaGlobal.objects.create_user(**validated_data)


class PessoaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = PessoaGlobal
        fields = [
            'id',
            'nome_completo',
            'cpf',
            'email_institucional',
            'lattes_url',
        ]
        
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
    tipo_vinculo_display = serializers.CharField(source='get_tipo_vinculo_display', read_only=True)

    class Meta:
        model = VinculoInstitucional
        fields = [
            'id', 'pessoa', 'nome_completo',
            'tipo_vinculo', 'tipo_vinculo_display',
            'matricula', 'departamento', 'status',
        ]
        