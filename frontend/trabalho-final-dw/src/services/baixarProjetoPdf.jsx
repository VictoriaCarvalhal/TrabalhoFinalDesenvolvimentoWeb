import { createRoot } from 'react-dom/client';
import React from 'react';
import api from './api';
import { useAuthStore } from '../stores/authStore';
import ProjetoPrint from '../components/projetos/imprimir/ProjetoPrint';
import '../components/projetos/imprimir/imprimir.css';

function formatarGeradoEm(data = new Date()) {
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function nomeArquivoPdf(dados, fallbackId) {
    const ano = dados?.projeto?.ano ?? '';
    const numero = dados?.projeto?.numero ?? '';
    if (ano !== '' && numero !== '') {
        return `projeto-${ano}-${numero}.pdf`;
    }
    return `projeto-${fallbackId ?? 'download'}.pdf`;
}

// Espera imagens (logo) terminarem de carregar dentro do container.
function esperarImagens(container, timeoutMs = 3000) {
    const imgs = Array.from(container.querySelectorAll('img'));
    if (imgs.length === 0) {
        return Promise.resolve();
    }
    return Promise.race([
        Promise.all(
            imgs.map((img) =>
                img.complete && img.naturalWidth !== 0
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          img.onload = () => resolve();
                          img.onerror = () => resolve();
                      })
            )
        ),
        new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
}

// Renderiza o ProjetoPrint fora da tela e salva como PDF, sem navegar.
export async function baixarProjetoPdfPorDados(dados, { geradoEm, geradoPor, projetoId } = {}) {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.backgroundColor = '#ffffff';

    const area = document.createElement('div');
    // pdf-export: liga as regras de tela da exportação (ex. rodapé visível).
    area.className = 'p-3 bg-white pdf-export';
    container.appendChild(area);
    document.body.appendChild(container);

    const root = createRoot(area);
    const textoGeradoEm = geradoEm ?? formatarGeradoEm(new Date());
    const textoGeradoPor =
        geradoPor ?? useAuthStore.getState().nomeUsuario ?? '—';

    try {
        root.render(
            <ProjetoPrint dados={dados} geradoEm={textoGeradoEm} geradoPor={textoGeradoPor} />
        );
        // Dá um respiro para o React montar e as imagens carregarem.
        await new Promise((resolve) => setTimeout(resolve, 150));
        await esperarImagens(container);

        // Import dinâmico: o bundle pesado (html2canvas+jsPDF) só baixa no clique.
        const { default: html2pdf } = await import('html2pdf.js');

        await html2pdf()
            .set({
                margin: 10,
                filename: nomeArquivoPdf(dados, projetoId),
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                // Blocos que cruzarem a divisa da página descem inteiros
                // (aceita espaço em branco no fim da página; só fatia o que
                // for maior que uma página inteira).
                pagebreak: {
                    mode: ['css', 'legacy'],
                    avoid: ['section', 'table', 'tr', 'h2', 'h3', 'li', 'p', '.capa', '.print-rodape'],
                },
            })
            .from(area)
            .save();
    } finally {
        // Limpa mesmo se falhar: desmonta o React e remove o container.
        try {
            root.unmount();
        } catch {
            // desmontagem opcional: segue para remover o nó.
        }
        container.remove();
    }
}

// Busca os dados no backend e baixa direto, sem abrir a página de impressão.
export async function baixarProjetoPdfPorId(projetoId) {
    const resposta = await api.get(`/projetos/${projetoId}/impressao/`);
    await baixarProjetoPdfPorDados(resposta.data, { projetoId });
}
