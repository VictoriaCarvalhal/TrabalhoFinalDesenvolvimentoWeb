"""Serializers das abas do formulario que aceitam varias linhas.

Cada aba (Unidades Envolvidas, Locais de Realizacao, Parcerias Internas,
Parcerias Externas, Membros da Equipe, Demanda de Bolsa e Plano de Trabalho)
vira uma lista de linhas ligadas a um projeto. O projeto nunca vem no corpo
da requisicao: ele e o da URL e a view injeta no save(). As chaves
estrangeiras vao com o nome por extenso ao lado do id, para o front nao
precisar cruzar tabela nenhuma.
"""
from django.db import transaction
from rest_framework import serializers

from projetos.models import (
    DemandaBolsa, LocalRealizacao, MembroEquipe, ParceriaExterna,
    ParceriaInterna, PlanoTrabalho, ProjetoUnidade,
    Projeto, ProjetoEndereco, ProjetoContato, ProjetoPalavraChave, ProjetoCaracterizacao, ProjetoDescricao
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

    class Meta:
        model = ParceriaInterna
        fields = [
            'id', 'unidade', 'unidade_sigla', 'unidade_nome',
            'departamento', 'departamento_nome',
            'nome_instituicao', 'sigla_instituicao', 'participacao',
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

    class Meta:
        model = ParceriaExterna
        fields = [
            'id', 'nome_instituicao', 'sigla_instituicao',
            'tipo_instituicao', 'tipo_instituicao_display',
            'participacao',
        ]


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

class ProjetoPalavraChaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjetoPalavraChave
        fields = ['id', 'palavra']

class ProjetoCaracterizacaoSerializer(serializers.ModelSerializer):
    natureza_display = serializers.CharField(source='natureza.descricao', read_only=True)
    linha_extensao_display = serializers.CharField(source='linha_extensao.descricao', read_only=True)
    area_principal_display = serializers.CharField(source='area_tematica_principal.descricao', read_only=True)
    area_secundaria_display = serializers.CharField(
        source='area_tematica_secundaria.descricao', read_only=True)
    grande_area_display = serializers.CharField(source='grande_area_cnpq.descricao', read_only=True)

    class Meta:
        model = ProjetoCaracterizacao
        fields = [
            'id', 'situacao_academica', 'vinculado_programa_extensao', 'curricularizado',
            'natureza', 'natureza_display', 'abrangencia', 'publico_alvo',
            'grande_area_cnpq', 'grande_area_display',
            'area_tematica_principal', 'area_principal_display',
            'area_tematica_secundaria', 'area_secundaria_display',
            'linha_extensao', 'linha_extensao_display'
        ]


class ProjetoDescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjetoDescricao
        fields = [
            'id', 'resumo', 'introducao', 'justificativa',
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
            'unidade_sigla', 'coordenador_nome', 'excluido', 'created_at', 'updated_at'
        ]
        read_only_fields = ['excluido']


class ProjetoCreateSerializer(serializers.ModelSerializer):
    endereco = ProjetoEnderecoSerializer(required=False)
    contatos = ProjetoContatoSerializer(many=True, required=False)
    caracterizacao = ProjetoCaracterizacaoSerializer(required=False)
    descricao = ProjetoDescricaoSerializer(required=False)
    # A aba guarda linhas de ProjetoUnidade (unidade + tipo de participacao),
    # e nao o M:N de UnidadeAcademica que existe no Projeto: dai o source.
    unidades_envolvidas = UnidadeEnvolvidaSerializer(
        source='projeto_unidades', many=True, required=False)
    parcerias_internas = ParceriaInternaSerializer(many=True, required=False)
    parcerias_externas = ParceriaExternaSerializer(many=True, required=False)
    locais_realizacao = LocalRealizacaoSerializer(many=True, required=False)
    # A aba e "membros_equipe" na tela e no payload, mas a relacao no Projeto
    # se chama "membros"; o source guarda essa traducao.
    membros_equipe = MembroEquipeSerializer(
        source='membros', many=True, required=False)
    planos_trabalho = PlanoTrabalhoSerializer(many=True, required=False)

    # Abas que nao podem repetir linha dentro do projeto (unique_together):
    # (campo no payload, chave em validated_data, campo que nao pode repetir,
    #  aviso). A repeticao precisa ser barrada aqui, porque o projeto so nasce
    # no create() e os serializers das abas nao tem o que consultar.
    ABAS_SEM_REPETICAO = (
        ('unidades_envolvidas', 'projeto_unidades', 'unidade',
         'A mesma unidade foi enviada mais de uma vez.'),
        ('membros_equipe', 'membros', 'vinculo',
         'A mesma pessoa foi enviada mais de uma vez na equipe.'),
        ('planos_trabalho', 'planos_trabalho', 'ano',
         'Ja existe um plano de trabalho para este ano.'),
    )

    class Meta:
        model = Projeto
        fields = [
            'id', 'ano', 'numero', 'titulo', 'situacao',
            'coordenador', 'unidade_proponente', 'departamento_proponente',
            'endereco', 'contatos', 'caracterizacao', 'descricao',
            'unidades_envolvidas', 'parcerias_internas', 'parcerias_externas',
            'locais_realizacao', 'membros_equipe', 'planos_trabalho',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Os serializers das abas leem context['projeto'] para checar repeticao.
        # Aqui o projeto ainda vai ser criado, entao vai None: a busca nao acha
        # nada e o validate() logo abaixo e quem barra o payload repetido.
        self._context.setdefault('projeto', None)

    def validate(self, attrs):
        for campo, chave, campo_unico, aviso in self.ABAS_SEM_REPETICAO:
            vistos = set()
            for linha in attrs.get(chave, []):
                if linha[campo_unico] in vistos:
                    # O erro sai com o nome do campo no payload, que e o que
                    # o front conhece.
                    raise serializers.ValidationError({campo: aviso})
                vistos.add(linha[campo_unico])
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        endereco_data = validated_data.pop('endereco', None)
        contatos_data = validated_data.pop('contatos', [])
        caracterizacao_data = validated_data.pop('caracterizacao', {})
        descricao_data = validated_data.pop('descricao', None)
        unidades_data = validated_data.pop('projeto_unidades', [])
        membros_data = validated_data.pop('membros', [])
        parcerias_data = validated_data.pop('parcerias_internas', [])
        parcerias_externas_data = validated_data.pop('parcerias_externas', [])
        locais_data = validated_data.pop('locais_realizacao', [])
        planos_data = validated_data.pop('planos_trabalho', [])

        # 1. Cria o projeto base
        projeto = Projeto.objects.create(**validated_data)

        # 2. Garante a criação dos registros 1:1 auxiliares
        caracterizacao, _ = ProjetoCaracterizacao.objects.get_or_create(projeto=projeto)
        descricao, _ = ProjetoDescricao.objects.get_or_create(projeto=projeto)

        # 3. Cria o endereço, mesmo que vazio: a tela de consulta conta com ele
        ProjetoEndereco.objects.create(projeto=projeto, **(endereco_data or {}))

        # 4. Cria os contatos se enviados
        for contato_data in contatos_data:
            ProjetoContato.objects.create(projeto=projeto, **contato_data)

        # 5. Cria/atualiza dados de caracterização se enviados
        if caracterizacao_data:
            for campo, valor in caracterizacao_data.items():
                setattr(caracterizacao, campo, valor)
            caracterizacao.save()
        if descricao_data:
            for campo, valor in descricao_data.items():
                setattr(descricao, campo, valor)
            descricao.save()

        # 6. Cria as unidades envolvidas se enviadas
        for unidade_data in unidades_data:
            ProjetoUnidade.objects.create(projeto=projeto, **unidade_data)

        # 7. Cria as parcerias internas se enviadas
        for parceria_data in parcerias_data:
            ParceriaInterna.objects.create(projeto=projeto, **parceria_data)

        # 8. Cria as parcerias externas se enviadas
        for parceria_externa_data in parcerias_externas_data:
            ParceriaExterna.objects.create(projeto=projeto, **parceria_externa_data)

        # 9. Cria os locais de realizacao se enviados
        for local_data in locais_data:
            LocalRealizacao.objects.create(projeto=projeto, **local_data)

        # 10. Cria os membros da equipe se enviados
        for membro_data in membros_data:
            MembroEquipe.objects.create(projeto=projeto, **membro_data)

        # 11. Cria os planos de trabalho se enviados
        for plano_data in planos_data:
            PlanoTrabalho.objects.create(projeto=projeto, **plano_data)

        return projeto


class ProjetoDetalheSimplesSerializer(serializers.ModelSerializer):
    endereco = ProjetoEnderecoSerializer(read_only=True)
    contatos = ProjetoContatoSerializer(many=True, read_only=True)
    caracterizacao = ProjetoCaracterizacaoSerializer(read_only=True)
    descricao = ProjetoDescricaoSerializer(read_only=True)

    class Meta:
        model = Projeto
        fields = [
            'id', 'ano', 'numero', 'titulo', 'situacao', 'excluido',
            'coordenador', 'unidade_proponente', 'departamento_proponente',
            'endereco', 'contatos', 'caracterizacao', 'descricao'
        ]
        read_only_fields = ['excluido']


class ProjetoImpressaoSerializer(serializers.ModelSerializer):
    situacao_display = serializers.CharField(
        source='get_situacao_display', read_only=True)
    coordenador_nome = serializers.CharField(
        source='coordenador.pessoa.nome_completo', read_only=True)
    unidade_sigla = serializers.CharField(
        source='unidade_proponente.sigla', read_only=True)
    unidade_nome = serializers.CharField(
        source='unidade_proponente.nome', read_only=True)
    departamento_nome = serializers.CharField(
        source='departamento_proponente.nome', read_only=True)

    class Meta:
        model = Projeto
        fields = [
            'id', 'ano', 'numero', 'titulo', 'situacao', 'situacao_display',
            'coordenador', 'coordenador_nome',
            'unidade_proponente', 'unidade_sigla', 'unidade_nome',
            'departamento_proponente', 'departamento_nome',
            'created_at', 'updated_at',
        ]
