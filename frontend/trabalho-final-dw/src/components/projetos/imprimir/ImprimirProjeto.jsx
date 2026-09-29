import printJS from 'print-js';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjetoImpressao } from '../../../hooks/useProjetoImpressao';
import { useAuthStore } from '../../../stores/authStore';
import api from '../../../services/api';
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


function formatarGeradoEm(data = new Date()) {
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}


function ImprimirProjeto() {
    const { id } = useParams();
    const { dados, loading, erro } = useProjetoImpressao(id);
    const nomeUsuarioStore = useAuthStore((state) => state.nomeUsuario);
    const setNomeUsuario = useAuthStore((state) => state.setNomeUsuario);
    const [nomeFallback, setNomeFallback] = useState(null);
    // "Gerado em" = momento do clique. Inicializa com agora para a
    // pré-visualização e atualiza no handleImprimir antes de imprimir.
    const [geradoEm, setGeradoEm] = useState(() => formatarGeradoEm(new Date()));

    // Reload direto na tela de impressão: o store pode estar vazio.
    useEffect(() => {
        if (nomeUsuarioStore) return;
        let cancelado = false;
        api.get('/auth/me/')
            .then((resposta) => {
                const nome = resposta.data?.nome_completo ?? resposta.data?.nome ?? null;
                if (!cancelado && nome) {
                    setNomeFallback(nome);
                    try {
                        setNomeUsuario(nome);
                    } catch {
                        // store indisponível: segue só com o fallback local.
                    }
                }
            })
            .catch(() => {})
            .finally(() => {});
        return () => {
            cancelado = true;
        };
    }, [nomeUsuarioStore, setNomeUsuario]);

    const geradoPor = nomeUsuarioStore ?? nomeFallback ?? '—';

    const executarImpressao = () => {
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

    const handleImprimir = () => {
        setGeradoEm(formatarGeradoEm(new Date()));
        setTimeout(executarImpressao, 60);
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
                <ProjetoPrint dados={dados} geradoEm={geradoEm} geradoPor={geradoPor} />
            </div>
        </div>
    );
}

export default ImprimirProjeto;
