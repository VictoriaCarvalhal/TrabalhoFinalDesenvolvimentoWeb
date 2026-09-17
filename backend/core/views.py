from rest_framework import generics, permissions
from core.serializers import RegisterPessoaSerializer, PessoaPerfilSerializer


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
