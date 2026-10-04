from django.db.models import Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers import CustomTokenObtainPairSerializer

from core.models import (
    AreaConhecimentoCNPq, AreaTematica, Departamento,
    LinhaExtensao, MunicipioIBGE, NaturezaExtensao,
    PeriodoExtensao, UnidadeAcademica, VinculoInstitucional,
)
from core.serializers import (
    MeuVinculoSerializer,
    PeriodoExtensaoSerializer,
    AreaConhecimentoCNPqSerializer, AreaTematicaSerializer,
    DepartamentoSerializer, LinhaExtensaoSerializer,
    MunicipioIBGESerializer, NaturezaExtensaoSerializer,
    PessoaPerfilSerializer, RegisterPessoaSerializer,
    UnidadeAcademicaSerializer, VinculoInstitucionalSerializer,
)


def _usuario_admin(user):
    """Mesma regra de projetos.permissions.is_admin (sem importar projetos aqui)."""
    return bool(
        getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False)
    )


# VIEW CUSTOMIZADA
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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


class MeusVinculosView(generics.ListCreateAPIView):
    """Vinculos da pessoa logada: lista os seus e deixa cadastrar um novo."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeuVinculoSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            VinculoInstitucional.objects
            .filter(pessoa=self.request.user)
            .select_related('pessoa')
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
        queryset_vinculos = (
            VinculoInstitucional.objects
            .filter(status='ATIVO')
            .select_related('pessoa')
        )
        
        filtro_tipo = self.request.query_params.get('tipo', '')
        if filtro_tipo:
            queryset_vinculos = queryset_vinculos.filter(tipo_vinculo=filtro_tipo)
            
        termo_busca = self.request.query_params.get('q', '').strip()
        if termo_busca:
            apenas_digitos = ''.join(filter(str.isdigit, termo_busca))
            condicoes_busca = Q(matricula__icontains=termo_busca) | Q(pessoa__nome_completo__icontains=termo_busca)
            if len(apenas_digitos) >= 3:
                condicoes_busca |= Q(pessoa__cpf__icontains=apenas_digitos)
            queryset_vinculos = queryset_vinculos.filter(condicoes_busca)
            
        return queryset_vinculos[:200] if termo_busca or filtro_tipo else queryset_vinculos


class PeriodoAtualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        periodo = PeriodoExtensao.atual()
        return Response(PeriodoExtensaoSerializer(periodo).data)


class PeriodoConfigView(APIView):
    """Leitura e alteração do período (exclusivo de admin)."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_ou_403(self, request):
        if not _usuario_admin(request.user):
            return None, Response(
                {'detail': 'Apenas administradores podem alterar o período de extensão.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return PeriodoExtensao.atual(), None

    def get(self, request):
        periodo, erro = self._get_ou_403(request)
        if erro is not None:
            return erro
        return Response(PeriodoExtensaoSerializer(periodo).data)

    def put(self, request):
        periodo, erro = self._get_ou_403(request)
        if erro is not None:
            return erro
        serializer = PeriodoExtensaoSerializer(periodo, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        periodo, erro = self._get_ou_403(request)
        if erro is not None:
            return erro
        serializer = PeriodoExtensaoSerializer(periodo, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
