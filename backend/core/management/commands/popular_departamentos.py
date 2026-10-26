from django.core.management.base import BaseCommand

from core.models import Departamento, UnidadeAcademica


# Departamentos por sigla de unidade. A lista segue a estrutura da UERJ, mas
# vale conferir com a listagem oficial antes de usar pra valer.
DEPARTAMENTOS = {
    'CAp-Uerj': [
        'Departamento de Ciências da Natureza',
        'Departamento de Ciências Humanas',
        'Departamento de Linguagens e Códigos',
        'Departamento de Matemática',
    ],
    'DIR': [
        'Departamento de Direito Público',
        'Departamento de Direito Privado',
        'Departamento de Direito Penal e Processual Penal',
        'Departamento de Teoria do Direito',
    ],
    'ENF': [
        'Departamento de Enfermagem Médico-Cirúrgica',
        'Departamento de Enfermagem Materno-Infantil',
        'Departamento de Enfermagem de Saúde Pública',
        'Departamento de Fundamentos de Enfermagem',
    ],
    'ESDI': [
        'Departamento de Projeto de Produto',
        'Departamento de Comunicação Visual',
        'Departamento de Teoria e História do Design',
    ],
    'FAF': [
        'Departamento de Administração',
        'Departamento de Ciências Contábeis',
        'Departamento de Finanças',
    ],
    'FAOC': [
        'Departamento de Oceanografia Física',
        'Departamento de Oceanografia Biológica',
        'Departamento de Oceanografia Geológica',
        'Departamento de Oceanografia Química',
    ],
    'FCE': [
        'Departamento de Teoria Econômica',
        'Departamento de Economia Aplicada',
        'Departamento de Análise Econômica',
    ],
    'FCEE': [
        'Departamento de Matemática',
        'Departamento de Física',
        'Departamento de Engenharia',
    ],
    'FCM': [
        'Departamento de Clínica Médica',
        'Departamento de Cirurgia Geral',
        'Departamento de Pediatria',
        'Departamento de Ginecologia e Obstetrícia',
        'Departamento de Patologia',
    ],
    'FCS': [
        'Departamento de Jornalismo',
        'Departamento de Publicidade e Propaganda',
        'Departamento de Relações Públicas',
        'Departamento de Teorias da Comunicação',
    ],
    'FEBF': [
        'Departamento de Educação',
        'Departamento de Ciências Humanas',
        'Departamento de Ciências Exatas',
    ],
    'FEN': [
        'Departamento de Engenharia Mecânica',
        'Departamento de Engenharia Eletrônica e Telecomunicações',
        'Departamento de Estruturas e Fundações',
        'Departamento de Engenharia Química',
        'Departamento de Engenharia Cartográfica',
    ],
    'FFP': [
        'Departamento de Educação',
        'Departamento de Letras',
        'Departamento de Matemática',
        'Departamento de Ciências Biológicas',
        'Departamento de Geografia',
        'Departamento de História',
    ],
    'FGEL': [
        'Departamento de Geologia Aplicada',
        'Departamento de Estratigrafia e Paleontologia',
        'Departamento de Mineralogia e Petrologia',
    ],
    'FSS': [
        'Departamento de Fundamentos do Serviço Social',
        'Departamento de Política Social',
        'Departamento de Métodos e Técnicas em Serviço Social',
    ],
    'IBRAG': [
        'Departamento de Biologia Animal',
        'Departamento de Biologia Vegetal',
        'Departamento de Genética',
        'Departamento de Ciências Fisiológicas',
        'Departamento de Histologia e Embriologia',
    ],
    'ICS': [
        'Departamento de Ciência Política',
        'Departamento de Sociologia',
        'Departamento de Antropologia',
    ],
    'IEFD': [
        'Departamento de Fundamentos da Educação Física',
        'Departamento de Desportos',
        'Departamento de Ginástica e Dança',
    ],
    'IESP': [
        'Departamento de Ciência Política',
        'Departamento de Sociologia',
    ],
    'IFADT': [
        'Departamento de Física Teórica',
        'Departamento de Física Aplicada e Termodinâmica',
        'Departamento de Eletrônica Quântica',
        'Departamento de Física Nuclear e Altas Energias',
    ],
    'IFCH': [
        'Departamento de Filosofia',
        'Departamento de História',
        'Departamento de Ciências Sociais',
    ],
    'IFHT': [
        'Departamento de Formação Humana',
        'Departamento de Tecnologias Educacionais',
    ],
    'IGEOG': [
        'Departamento de Geografia Física',
        'Departamento de Geografia Humana',
        'Departamento de Análise Geoambiental',
    ],
    'IMS': [
        'Departamento de Planejamento e Administração em Saúde',
        'Departamento de Epidemiologia',
        'Departamento de Políticas e Instituições de Saúde',
    ],
    'INU': [
        'Departamento de Nutrição Aplicada',
        'Departamento de Nutrição Básica e Experimental',
        'Departamento de Nutrição Social',
    ],
    'IP': [
        'Departamento de Psicologia Social e Institucional',
        'Departamento de Psicologia Clínica',
        'Departamento de Psicologia do Desenvolvimento',
    ],
    'IPRJ': [
        'Departamento de Modelagem Computacional',
        'Departamento de Engenharia Mecânica e Energia',
        'Departamento de Ciência da Computação',
    ],
    'ODO': [
        'Departamento de Formação Básica',
        'Departamento de Odontologia Preventiva e Comunitária',
        'Departamento de Prótese e Materiais Dentários',
        'Departamento de Procedimentos Clínicos Integrados',
    ],
    'QUI': [
        'Departamento de Química Analítica',
        'Departamento de Química Orgânica',
        'Departamento de Físico-Química',
        'Departamento de Química Geral e Inorgânica',
    ],
}


class Command(BaseCommand):
    help = 'Cria os departamentos que faltam nas unidades academicas.'

    def handle(self, *args, **opcoes):
        criados = 0
        sem_unidade = []

        for sigla, nomes in DEPARTAMENTOS.items():
            unidade = UnidadeAcademica.objects.filter(sigla=sigla).first()
            if unidade is None:
                sem_unidade.append(sigla)
                continue
            for nome in nomes:
                _, novo = Departamento.objects.get_or_create(
                    unidade=unidade,
                    nome=nome,
                    defaults={'ativo': True},
                )
                if novo:
                    criados += 1

        self.stdout.write(f'Departamentos criados: {criados}')
        if sem_unidade:
            self.stdout.write(
                f'Sem unidade correspondente: {", ".join(sem_unidade)}'
            )

        total = UnidadeAcademica.objects.filter(ativo=True).count()
        com_departamento = (
            UnidadeAcademica.objects
            .filter(ativo=True, departamentos__ativo=True)
            .distinct()
            .count()
        )
        self.stdout.write(
            f'Unidades com departamento: {com_departamento} de {total}'
        )
