"""Serializers das abas do formulario que aceitam varias linhas.

Cada aba (Unidades Envolvidas, Locais de Realizacao, Parcerias Internas,
Parcerias Externas, Membros da Equipe, Demanda de Bolsa e Plano de Trabalho)
vira uma lista de linhas ligadas a um projeto. O projeto nunca vem no corpo
da requisicao: ele e o da URL e a view injeta no save(). As chaves
estrangeiras vao com o nome por extenso ao lado do id, para o front nao
precisar cruzar tabela nenhuma.
"""
import re

from rest_framework import serializers

from projetos.models import (
    DemandaBolsa, LocalRealizacao, MembroEquipe, ParceriaExterna,
    ParceriaInterna, PlanoTrabalho, ProjetoUnidade,
    Projeto, ProjetoEndereco, ProjetoContato, ProjetoCaracterizacao, ProjetoDescricao
)


class LinhaDoProjetoSerializer(serializers.ModelSerializer):
    """Base das linhas: sabe qual e o projeto e checa repeticao dentro dele."""

    @property
    def projeto(self):
        return self.context['projeto']

    def ja_existe(self, **campos):
        """True se outra linha deste projeto tiver os mesmos valores."""
        qs = self.Meta.model.objects.filter(projeto=self.projeto, **campos)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        return qs.exists()

    def valor(self, attrs, campo):
        """Valor do campo apos o PATCH: o novo se veio, senao o gravado."""
        if campo in attrs:
            return attrs[campo]
        return getattr(self.instance, campo, None)


class UnidadeEnvolvidaSerializer(LinhaDoProjetoSerializer):
    unidade_sigla = serializers.CharField(source='unidade.sigla', read_only=True)
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)
    tipo_participacao_display = serializers.CharField(
        source='get_tipo_participacao_display', read_only=True)

    class Meta:
        model = ProjetoUnidade
        fields = [
            'id', 'unidade', 'unidade_sigla', 'unidade_nome',
            'tipo_participacao', 'tipo_participacao_display',
        ]

    def validate(self, attrs):
        unidade = self.valor(attrs, 'unidade')
        if unidade is not None and self.ja_existe(unidade=unidade):
            raise serializers.ValidationError(
                {'unidade': 'Esta unidade ja esta na lista de unidades envolvidas.'})
        return attrs


class LocalRealizacaoSerializer(LinhaDoProjetoSerializer):
    municipio_nome = serializers.CharField(source='municipio.nome', read_only=True)
    municipio_uf = serializers.CharField(source='municipio.uf', read_only=True)

    class Meta:
        model = LocalRealizacao
        fields = [
            'id', 'nome_local', 'municipio', 'municipio_nome', 'municipio_uf',
            'endereco_completo',
        ]


class ParceriaInternaSerializer(LinhaDoProjetoSerializer):
    unidade_sigla = serializers.CharField(source='unidade.sigla', read_only=True)
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)
    departamento_nome = serializers.CharField(
        source='departamento.nome', read_only=True, default=None)
    # "Participacao (no maximo 500 caracteres)" no formulario
    descricao_contribuicao = serializers.CharField(
        max_length=500, required=False, allow_blank=True)

    class Meta:
        model = ParceriaInterna
        fields = [
            'id', 'unidade', 'unidade_sigla', 'unidade_nome',
            'departamento', 'departamento_nome',
            'nome_contato', 'descricao_contribuicao', 'formalizado_convenio',
        ]

    def validate(self, attrs):
        unidade = self.valor(attrs, 'unidade')
        departamento = self.valor(attrs, 'departamento')
        pertence = departamento is None or unidade is None \
            or departamento.unidade_id == unidade.pk
        if not pertence:
            raise serializers.ValidationError(
                {'departamento': 'O departamento escolhido nao pertence a unidade escolhida.'})
        return attrs


class ParceriaExternaSerializer(LinhaDoProjetoSerializer):
    tipo_instituicao_display = serializers.CharField(
        source='get_tipo_instituicao_display', read_only=True)
    # Maior que o model (14) para caber a pontuacao antes de ela ser tirada.
    cnpj = serializers.CharField(max_length=18, required=False, allow_blank=True)

    class Meta:
        model = ParceriaExterna
        fields = [
            'id', 'nome_instituicao', 'cnpj',
            'tipo_instituicao', 'tipo_instituicao_display',
            'nome_contato', 'descricao_contribuicao', 'formalizado_convenio',
        ]

    def validate_cnpj(self, cnpj):
        # Aceita "12.345.678/0001-90" e guarda so os 14 digitos.
        digitos = re.sub(r'\D', '', cnpj or '')
        if digitos and len(digitos) != 14:
            raise serializers.ValidationError('O CNPJ precisa ter 14 digitos.')
        return digitos


class MembroEquipeSerializer(LinhaDoProjetoSerializer):
    # A tabela da tela mostra tipo de vinculo, matricula, CPF, nome e
    # cargo/perfil. Tudo isso vem do vinculo da pessoa, por isso vai junto.
    nome = serializers.CharField(source='vinculo.pessoa.nome_completo', read_only=True)
    cpf = serializers.CharField(source='vinculo.pessoa.cpf', read_only=True)
    matricula = serializers.CharField(source='vinculo.matricula', read_only=True)
    tipo_vinculo = serializers.CharField(source='vinculo.tipo_vinculo', read_only=True)
    tipo_vinculo_display = serializers.CharField(
        source='vinculo.get_tipo_vinculo_display', read_only=True)
    funcao_display = serializers.CharField(source='get_funcao_display', read_only=True)

    class Meta:
        model = MembroEquipe
        fields = [
            'id', 'vinculo', 'nome', 'cpf', 'matricula',
            'tipo_vinculo', 'tipo_vinculo_display',
            'funcao', 'funcao_display', 'carga_horaria_semanal',
            'data_entrada', 'data_saida',
        ]

    def validate(self, attrs):
        vinculo = self.valor(attrs, 'vinculo')
        if vinculo is not None and self.ja_existe(vinculo=vinculo):
            raise serializers.ValidationError(
                {'vinculo': 'Esta pessoa ja esta na equipe deste projeto.'})

        entrada = self.valor(attrs, 'data_entrada')
        saida = self.valor(attrs, 'data_saida')
        if entrada and saida and saida < entrada:
            raise serializers.ValidationError(
                {'data_saida': 'A data de saida nao pode ser anterior a de entrada.'})
        return attrs


class DemandaBolsaSerializer(LinhaDoProjetoSerializer):
    tipo_bolsa_display = serializers.CharField(source='get_tipo_bolsa_display', read_only=True)
    quantidade = serializers.IntegerField(min_value=1)

    class Meta:
        model = DemandaBolsa
        fields = ['id', 'tipo_bolsa', 'tipo_bolsa_display', 'quantidade', 'justificativa']

    def validate(self, attrs):
        tipo = self.valor(attrs, 'tipo_bolsa')
        if tipo and self.ja_existe(tipo_bolsa=tipo):
            raise serializers.ValidationError(
                {'tipo_bolsa': 'Este tipo de bolsa ja foi pedido neste projeto. Altere a quantidade da linha existente.'})
        return attrs


class PlanoTrabalhoSerializer(LinhaDoProjetoSerializer):
    # Os dois textos sao "(no maximo 3000 caracteres)" no formulario.
    resultados_esperados = serializers.CharField(max_length=3000, required=False, allow_blank=True)
    cronograma_atividades = serializers.CharField(max_length=3000, required=False, allow_blank=True)

    class Meta:
        model = PlanoTrabalho
        fields = ['id', 'ano', 'resultados_esperados', 'cronograma_atividades']

    def validate(self, attrs):
        ano = self.valor(attrs, 'ano')
        if ano and self.ja_existe(ano=ano):
            raise serializers.ValidationError(
                {'ano': 'Ja existe um plano de trabalho para este ano neste projeto.'})
        return attrs




#------------- serializers das seções simples

class ProjetoEnderecoSerializer(serializers.ModelSerializer):
    municipio_nome = serializers.CharField(source='municipio.nome', read_only=True)
    municipio_uf = serializers.CharField(source='municipio.uf', read_only=True)

    class Meta:
        model = ProjetoEndereco
        fields = [
            'id', 'logradouro', 'numero', 'complemento',
            'bairro', 'municipio', 'municipio_nome', 'municipio_uf', 'cep'
        ]


class ProjetoContatoSerializer(serializers.ModelSerializer):
    tipo_contato_display = serializers.CharField(source='get_tipo_contato_display', read_only=True)
    tipo_telefone_display = serializers.CharField(source='get_tipo_telefone_display', read_only=True)

    class Meta:
        model = ProjetoContato
        fields = [
            'id', 'tipo_contato', 'tipo_contato_display',
            'valor', 'ddd', 'ramal', 'tipo_telefone', 'tipo_telefone_display'
        ]


class ProjetoCaracterizacaoSerializer(serializers.ModelSerializer):
    natureza_display = serializers.CharField(source='natureza.descricao', read_only=True)
    linha_extensao_display = serializers.CharField(source='linha_extensao.descricao', read_only=True)
    area_principal_display = serializers.CharField(source='area_tematica_principal.descricao', read_only=True)
    grande_area_display = serializers.CharField(source='grande_area_cnpq.descricao', read_only=True)

    class Meta:
        model = ProjetoCaracterizacao
        fields = [
            'id', 'situacao_academica', 'vinculado_programa_extensao', 'curricularizado',
            'natureza', 'natureza_display', 'abrangencia', 'publico_alvo',
            'grande_area_cnpq', 'grande_area_display',
            'area_tematica_principal', 'area_principal_display',
            'area_tematica_secundaria', 'linha_extensao', 'linha_extensao_display'
        ]


class ProjetoDescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjetoDescricao
        fields = [
            'id', 'resumo', 'palavras_chave', 'introducao', 'justificativa',
            'objetivo_geral', 'objetivos_especificos', 'metodologia_avaliacao',
            'relacao_ensino', 'relacao_pesquisa', 'interacao_dialogica',
            'interdisciplinaridade', 'impacto_formacao', 'indissociabilidade',
            'impacto_social', 'referencias_bibliograficas'
        ]


class ProjetoResumoSerializer(serializers.ModelSerializer):
    unidade_sigla = serializers.CharField(source='unidade_proponente.sigla', read_only=True)
    coordenador_nome = serializers.CharField(source='coordenador.pessoa.nome_completo', read_only=True)
    situacao_display = serializers.CharField(source='get_situacao_display', read_only=True)

    class Meta:
        model = Projeto
        fields = [
            'id', 'ano', 'numero', 'titulo', 'situacao', 'situacao_display',
            'unidade_sigla', 'coordenador_nome', 'created_at', 'updated_at'
        ]


class ProjetoDetalheSimplesSerializer(serializers.ModelSerializer):
    endereco = ProjetoEnderecoSerializer(read_only=True)
    contatos = ProjetoContatoSerializer(many=True, read_only=True)
    caracterizacao = ProjetoCaracterizacaoSerializer(read_only=True)
    descricao = ProjetoDescricaoSerializer(read_only=True)

    class Meta:
        model = Projeto
        fields = [
            'id', 'ano', 'numero', 'titulo', 'situacao',
            'coordenador', 'unidade_proponente', 'departamento_proponente',
            'endereco', 'contatos', 'caracterizacao', 'descricao'
        ]
     
