import printJS from 'print-js';
import { useParams } from 'react-router-dom';
import { useProjetoImpressao } from '../../../hooks/useProjetoImpressao';
import ProjetoPrint from './ProjetoPrint';

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
                    Não foi possível carregar os dados (erro: {erro}). Verifique se o backend está rodando.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3 no-print">
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
