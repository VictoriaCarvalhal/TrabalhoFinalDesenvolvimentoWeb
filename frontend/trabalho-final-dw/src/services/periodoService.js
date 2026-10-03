import api from './api';


// Status do período único/global de extensão (qualquer logado pode ler).
export async function getPeriodoAtual() {
    const resposta = await api.get('/periodo/atual/');
    return resposta.data;
}

// Config completa do período (só admin).
export async function getPeriodoConfig() {
    const resposta = await api.get('/periodo/config/');
    return resposta.data;
}

// Altera datas/chave/mensagem (só admin). Aceita parcial.
export async function atualizarPeriodo(dados) {
    const resposta = await api.patch('/periodo/config/', dados);
    return resposta.data;
}
