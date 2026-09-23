from rest_framework import generics, permissions
from core.serializers import RegisterPessoaSerializer, PessoaPerfilSerializer
from core.models import MunicipioIBGE
from core.serializers import MunicipioIBGESerializer
from core.models import Departamento
from core.models import UnidadeAcademica
from core.serializers import DepartamentoSerializer, UnidadeAcademicaSerializer

class RegisterView(generics.CreateAPIView):
    """Endpoint público para cadastro de novas Pessoas/Usuários."""
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterPessoaSerializer


class PerfilView(generics.RetrieveUpdateAPIView):
    """Endpoint protegido para obter ou atualizar o perfil do usuário logado."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PessoaPerfilSerializer

    def get_object(self):
        return self.request.user

class MunicipioIBGEListView(generics.ListAPIView):
    """Endpoint para listar municípios (usado nos dropdowns do front-end)."""
    queryset = MunicipioIBGE.objects.filter(ativo=True).order_by('nome')
    serializer_class = MunicipioIBGESerializer
    permission_classes = [permissions.AllowAny] # Pode ser AllowAny para o dropdown carregar fácil

class UnidadeAcademicaListView(generics.ListAPIView):
    queryset = UnidadeAcademica.objects.filter(ativo=True).order_by('sigla')
    serializer_class = UnidadeAcademicaSerializer
    permission_classes = [permissions.AllowAny]

class DepartamentoListView(generics.ListAPIView):
    serializer_class = DepartamentoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Departamento.objects.filter(ativo=True).order_by('nome')
        unidade_id = self.request.query_params.get('unidade')
        if unidade_id:
            queryset = queryset.filter(unidade_id=unidade_id)
        return queryset
