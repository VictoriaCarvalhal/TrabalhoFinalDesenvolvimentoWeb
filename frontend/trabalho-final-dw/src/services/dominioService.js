import api from './api';

export function buscarDepartamentos() {
    return api.get('/dominios/departamentos/');
}

export function buscarUnidades() {
    return api.get('/dominios/unidades/');
}

export async function buscarPerfil() {
    return api.get('/auth/me/');
}

export async function buscarVinculos() {
    return api.get('/dominios/vinculos/');
}

// Vinculos da pessoa logada. Separado de buscarVinculos, que traz os de
// todo mundo e obriga o front a filtrar.
export async function buscarMeusVinculos() {
    return api.get('/auth/me/vinculos/');
}

export async function criarMeuVinculo(dados) {
    return api.post('/auth/me/vinculos/', dados);
}

export async function buscarNaturezas() {
    return await api.get(`/dominios/naturezas/`);
}

export async function buscarAreasCNPQ() {
    return await api.get(`/dominios/areas-cnpq/`);
}

export async function buscarAreasTematicas() {
    return await api.get(`/dominios/areas-tematicas/`);
}

export async function buscarLinhasExtensao() {
    return await api.get(`/dominios/linhas-extensao/`);
}
