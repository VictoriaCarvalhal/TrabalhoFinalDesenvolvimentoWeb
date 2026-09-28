import printJS from 'print-js';
import { useParams } from 'react-router-dom';
import { useProjetoImpressao } from '../../../hooks/useProjetoImpressao';
import ProjetoPrint from './ProjetoPrint';
import './imprimir.css';


// Texto amigável para cada falha do GET /projetos/:id/impressao/.
function mensagemErro(erro) {
    if (erro === 401) {
        return 'Sua sessão expirou. Faça login novamente.';
    }
    if (erro === 404) {
        return 'Projeto não encontrado ou você não tem acesso a ele.';
    }
    if (erro === 'rede') {
        return 'Não foi possível falar com o backend. Verifique se ele está rodando.';
    }
    return `Não foi possível carregar os dados (erro: ${erro}).`;
}


function ImprimirProjeto() {
    const { id } = useParams();
    const { dados, loading, erro } = useProjetoImpressao(id);

    const handleImprimir = () => {
        try {
            printJS({
                printable: 'area-impressao',
                type: 'html',
                showModal: true,
                modalMessage: 'Preparando documento...',
                targetStyles: [],
                scanStyles: false,
                css: '/imprimir-print.css',
                ignoreElements: ['barra-impressao'],
                documentTitle: `Projeto ${dados?.projeto?.ano ?? ''}/${dados?.projeto?.numero ?? ''}`,
            });
        } catch {
            window.print();
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <p>Carregando dados do projeto...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {mensagemErro(erro)}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div id="barra-impressao" className="d-flex justify-content-between align-items-center mb-3 no-print d-print-none">
                <h1 className="h4 mb-0">Impressão do projeto</h1>
                <button type="button" className="btn btn-primary" onClick={handleImprimir}>
                    <i className="bi bi-printer me-2"></i>
                    Imprimir
                </button>
            </div>

            <div id="area-impressao" className="p-3 border rounded bg-white">
                <ProjetoPrint dados={dados} />
            </div>
        </div>
    );
}

export default ImprimirProjeto;
