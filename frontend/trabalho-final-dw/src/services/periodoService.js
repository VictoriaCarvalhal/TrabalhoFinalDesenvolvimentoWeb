import api from './api';


export async function getPeriodoAtual() {
    const resposta = await api.get('/periodo/atual/');
    return resposta.data;
}

export async function getPeriodoConfig() {
    const resposta = await api.get('/periodo/config/');
    return resposta.data;
}

export async function atualizarPeriodo(dados) {
    const resposta = await api.patch('/periodo/config/', dados);
    return resposta.data;
}
