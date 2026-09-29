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

export async function buscarNaturezas() {
    return await api.get(`/dominios/naturezas/`);
}

export async function buscarAreasCNPQ() {
    return await api.get(`/dominios/areas-cnpq/`);
}

export async function buscarAreasTematicas() {
    return await api.get(`/dominios/areas-tematicas/`);
}