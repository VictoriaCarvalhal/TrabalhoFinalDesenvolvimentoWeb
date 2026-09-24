from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import (
    AreaConhecimentoCNPq, AreaTematica, Departamento,
    LinhaExtensao, MunicipioIBGE, NaturezaExtensao,
    UnidadeAcademica, VinculoInstitucional,
)
from core.serializers import (
    AreaConhecimentoCNPqSerializer, AreaTematicaSerializer,
    DepartamentoSerializer, LinhaExtensaoSerializer,
    MunicipioIBGESerializer, NaturezaExtensaoSerializer,
    PessoaPerfilSerializer, RegisterPessoaSerializer,
    UnidadeAcademicaSerializer, VinculoInstitucionalSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterPessoaSerializer


class PerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PessoaPerfilSerializer

    def get_object(self):
        return self.request.user


class SessionCheckView(APIView):
    """
    Endpoint para verificar se a sessão/token JWT do usuário continua ativa e válida.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = PessoaPerfilSerializer(request.user)
        return Response(
            {
                "authenticated": True,
                "user": serializer.data
            },
            status=status.HTTP_200_OK
        )


class LookupViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class UnidadeAcademicaViewSet(LookupViewSet):
    queryset = UnidadeAcademica.objects.filter(ativo=True)
    serializer_class = UnidadeAcademicaSerializer


class DepartamentoViewSet(LookupViewSet):
    serializer_class = DepartamentoSerializer

    def get_queryset(self):
        qs = Departamento.objects.filter(ativo=True).select_related('unidade')
        unidade_id = self.request.query_params.get('unidade')
        if unidade_id:
            qs = qs.filter(unidade_id=unidade_id)
        return qs


class MunicipioIBGEViewSet(LookupViewSet):
    serializer_class = MunicipioIBGESerializer

    def get_queryset(self):
        qs = MunicipioIBGE.objects.filter(ativo=True)
        uf = self.request.query_params.get('uf')
        if uf:
            qs = qs.filter(uf=uf.upper())
        return qs


class NaturezaExtensaoViewSet(LookupViewSet):
    queryset = NaturezaExtensao.objects.filter(ativo=True)
    serializer_class = NaturezaExtensaoSerializer


class LinhaExtensaoViewSet(LookupViewSet):
    queryset = LinhaExtensao.objects.filter(ativo=True)
    serializer_class = LinhaExtensaoSerializer


class AreaTematicaViewSet(LookupViewSet):
    queryset = AreaTematica.objects.filter(ativo=True)
    serializer_class = AreaTematicaSerializer


class AreaConhecimentoCNPqViewSet(LookupViewSet):
    serializer_class = AreaConhecimentoCNPqSerializer

    def get_queryset(self):
        qs = AreaConhecimentoCNPq.objects.filter(ativo=True)
        nivel = self.request.query_params.get('nivel')
        if nivel:
            qs = qs.filter(nivel=nivel)
        parent = self.request.query_params.get('parent')
        if parent:
            qs = qs.filter(parent_id=parent)
        return qs


class VinculoInstitucionalViewSet(LookupViewSet):
    serializer_class = VinculoInstitucionalSerializer

    def get_queryset(self):
        return (
            VinculoInstitucional.objects
            .filter(status='ATIVO')
            .select_related('pessoa')
        )
