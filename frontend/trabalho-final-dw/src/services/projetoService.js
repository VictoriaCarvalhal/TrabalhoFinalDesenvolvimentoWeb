import api from './api';


export async function criarProjeto(dados) {
    const resposta = await api.post('/projetos/', dados);
    return resposta.data.id;
}

export async function atualizarEndereco(id, dados) {
    await api.patch(`/projetos/${id}/endereco/`, dados);
}


