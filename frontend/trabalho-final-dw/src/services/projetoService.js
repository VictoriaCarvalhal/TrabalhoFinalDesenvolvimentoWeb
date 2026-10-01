import api from './api';


export async function criarProjeto(dados) {
    const resposta = await api.post('/projetos/', dados);
    return resposta.data.id;
}

export async function atualizarEndereco(projeto_id, dados) {
    await api.patch(`/projetos/${projeto_id}/endereco/`, dados);
}

export async function atualizarCaracterizacao(projeto_id, dados) {
    await api.patch(`/projetos/${projeto_id}/caracterizacao/`, dados);
}

export async function atualizarDescricao(projeto_id, dados) {
    await api.patch(`/projetos/${projeto_id}/descricao/`, dados);
}

export async function criarPlanoDeTrabalho(projeto_id, dados) {
    const resposta = await api.post(`/projetos/${projeto_id}/planos-trabalho/`, dados);
    return resposta.data.id;
}

export async function criarContato(projeto_id, dados) {
    const resposta = await api.post(`/projetos/${projeto_id}/contatos/`, dados);
    return resposta.data.id;
}

export async function criarPalavraChave(projeto_id, dados) {
    const resposta = await api.post(`/projetos/${projeto_id}/palavras_chave/`, dados);
    return resposta.data.id;
}

export async function excluirProjeto(projeto_id) {
    await api.delete(`/projetos/${projeto_id}/`);
}
