import api from './api';


export async function criarProjeto(dados) {
    const resposta = await api.post('/projetos/', dados);
    return resposta.data.id;
}

export async function atualizarEndereco(id, dados) {
    await api.patch(`/projetos/${id}/endereco/`, dados);
}

export async function atualizarCaracterizacao(id, dados) {
    await api.patch(`/projetos/${id}/caracterizacao/`, dados);
}

export async function atualizarDescricao(id, dados) {
    await api.patch(`/projetos/${id}/descricao/`, dados);
}


