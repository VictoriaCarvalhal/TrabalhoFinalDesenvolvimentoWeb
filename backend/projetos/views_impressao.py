from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework.views import APIView

from projetos.serializers import (
    ProjetoCaracterizacaoSerializer, ProjetoContatoSerializer,
    ProjetoDescricaoSerializer, ProjetoEnderecoSerializer,
    ProjetoImpressaoSerializer, ProjetoPalavraChaveSerializer,
)
from projetos.views import ABAS, ProjetoDaUrlMixin


class ProjetoImpressaoView(ProjetoDaUrlMixin, APIView):

    def _secao_unica(self, projeto, nome, serializer_class):
        try:
            instancia = getattr(projeto, nome)
        except ObjectDoesNotExist:
            return None
        if instancia is None:
            return None
        return serializer_class(instancia).data

    def get(self, request, projeto_id):
        projeto = self.get_projeto()
        contexto = {'request': request, 'projeto': projeto}
        resposta = {
            'projeto': ProjetoImpressaoSerializer(projeto).data,
            'endereco': self._secao_unica(
                projeto, 'endereco', ProjetoEnderecoSerializer),
            'contatos': ProjetoContatoSerializer(
                projeto.contatos.all(), many=True).data,
            'palavras_chave': ProjetoPalavraChaveSerializer(
                projeto.palavras_chave.all(), many=True).data,
            'caracterizacao': self._secao_unica(
                projeto, 'caracterizacao', ProjetoCaracterizacaoSerializer),
            'descricao': self._secao_unica(
                projeto, 'descricao', ProjetoDescricaoSerializer),
        }
        for chave, viewset, related_name in ABAS:
            linhas = (
                getattr(projeto, related_name)
                .select_related(*viewset.select_related)
                .all()
            )
            resposta[chave] = viewset.serializer_class(
                linhas, many=True, context=contexto).data
        return Response(resposta)
