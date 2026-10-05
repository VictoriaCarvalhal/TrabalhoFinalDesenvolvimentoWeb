from django.db.models import Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers import CustomTokenObtainPairSerializer

from core.models import (
    AreaConhecimentoCNPq, AreaTematica, Departamento,
    LinhaExtensao, MunicipioIBGE, NaturezaExtensao,
    PeriodoExtensao, PessoaGlobal, UnidadeAcademica, VinculoInstitucional,
)
from core.serializers import (
    MeuVinculoSerializer,
    PeriodoExtensaoSerializer,
    AreaConhecimentoCNPqSerializer, AreaTematicaSerializer,
    DepartamentoSerializer, LinhaExtensaoSerializer,
    EsqueciSenhaSerializer, PrimeiroAcessoSerializer, RedefinirSenhaSerializer,
    MunicipioIBGESerializer, NaturezaExtensaoSerializer,
    PessoaPerfilSerializer, RegisterPessoaSerializer,
    UnidadeAcademicaSerializer, VinculoInstitucionalSerializer,
)
import logging

logger = logging.getLogger(__name__)


class EsqueciSenhaRateThrottle(AnonRateThrottle):
    scope = 'password_reset'


def _usuario_admin(user):
    return bool(
        getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False)
    )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterPessoaSerializer


class EsqueciSenhaView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [EsqueciSenhaRateThrottle]

    def post(self, request):
        serializer = EsqueciSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        usuario = PessoaGlobal.objects.filter(
            email_institucional__iexact=email,
            is_active=True
        ).first()

        if usuario:
            uid = urlsafe_base64_encode(force_bytes(usuario.pk))
            token = default_token_generator.make_token(usuario)

            link = (
                f'{settings.FRONTEND_URL}/redefinir-senha'
                f'?uid={uid}&token={token}'
            )

            mensagem = (
                f'Olá, {usuario.nome_completo}.\n\n'
                'Foi solicitada uma redefinição de senha para sua conta.\n\n'
                f'Para cadastrar uma nova senha, acesse o link abaixo:\n{link}\n\n'
                'Se você não solicitou a alteração, ignore este e-mail.'
            )

            try:
                send_mail(
                    'Redefinição de senha',
                    mensagem,
                    settings.DEFAULT_FROM_EMAIL,
                    [usuario.email_institucional],
                    fail_silently=False,
                )
            except Exception:
                logger.exception(
                    'Falha ao enviar e-mail de redefinição de senha'
                )

        return Response({
            'mensagem': 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.'
        })


class RedefinirSenhaView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RedefinirSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        nova_senha = serializer.validated_data['nova_senha']

        try:
            usuario_id = force_str(urlsafe_base64_decode(uid))
            usuario = PessoaGlobal.objects.get(pk=usuario_id)
        except (PessoaGlobal.DoesNotExist, ValueError, TypeError):
            return Response(
                {'erro': 'Link de recuperação inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(usuario, token):
            return Response(
                {'erro': 'O link de recuperação é inválido ou expirou.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(nova_senha, user=usuario)
        except ValidationError as erro:
            return Response(
                {'nova_senha': erro.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.set_password(nova_senha)
        usuario.save()

        return Response({
            'mensagem': 'Senha alterada com sucesso.'
        })


class PrimeiroAcessoRateThrottle(AnonRateThrottle):
    scope = 'primeiro_acesso'


class PrimeiroAcessoView(APIView):
    """
    Primeiro acesso: a pessoa já está cadastrada pela universidade, mas ainda
    não tem senha. Ela confirma quem é (CPF + matrícula ou e-mail institucional)
    e cria a senha para entrar no sistema.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PrimeiroAcessoRateThrottle]

    def post(self, request):
        serializer = PrimeiroAcessoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cpf = serializer.validated_data['cpf']
        identificacao = serializer.validated_data['identificacao'].strip()
        nova_senha = serializer.validated_data['nova_senha']

        usuario = PessoaGlobal.objects.filter(cpf=cpf, is_active=True).first()

        # A matrícula pode ser de qualquer vínculo da pessoa.
        confere = usuario is not None and (
            (usuario.email_institucional or '').lower() == identificacao.lower()
            or usuario.vinculos.filter(matricula__iexact=identificacao).exists()
        )

        # Mesma mensagem nos dois casos para não revelar quais CPFs existem.
        if not confere:
            return Response(
                {'erro': 'Os dados informados não conferem com o cadastro da universidade.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if usuario.password and usuario.has_usable_password():
            return Response(
                {'erro': 'Este CPF já tem senha cadastrada. Use "Esqueci a senha" se não lembrar dela.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(nova_senha, user=usuario)
        except ValidationError as erro:
            return Response(
                {'nova_senha': erro.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.set_password(nova_senha)
        usuario.save()

        return Response({
            'mensagem': 'Senha criada com sucesso. Agora é só entrar com seu CPF e a nova senha.'
        })


class PerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PessoaPerfilSerializer

    def get_object(self):
        return self.request.user


class SessionCheckView(APIView):
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
    # Lista pessoas, entao so para quem esta logado.
    permission_classes = [permissions.IsAuthenticated]
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
