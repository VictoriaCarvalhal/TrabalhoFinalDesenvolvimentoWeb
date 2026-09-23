import re
from rest_framework import serializers
from core.models import PessoaGlobal
from core.models import MunicipioIBGE

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
        password = validated_data.pop('password')
        user = PessoaGlobal.objects.create_user(
            password=password, **validated_data
        )
        return user


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

class MunicipioIBGESerializer(serializers.ModelSerializer):
    class Meta:
        model = MunicipioIBGE
        fields = [
            'codigo_ibge',
            'nome',
            'uf',
        ]

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
