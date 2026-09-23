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
