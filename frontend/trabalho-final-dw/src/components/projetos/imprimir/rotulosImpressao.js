
export function simNao(valor) {
    if (valor === true) return 'Sim';
    if (valor === false) return 'Não';
    return '—';
}

export const ABRANGENCIA_LABELS = {
    LOCAL: 'Local',
    REGIONAL: 'Regional',
    NACIONAL: 'Nacional',
    INTERNACIONAL: 'Internacional',
};

export const SITUACAO_ACADEMICA_LABELS = {
    NOVO: 'Novo',
    RENOVACAO: 'Renovação',
    REESTRUTURACAO: 'Reestruturação',
};

export function rotuloCodigo(valor, mapa) {
    if (valor == null || valor === '') return '—';
    return mapa[valor] ?? valor;
}

export function formatarData(valor) {
    if (!valor) return '—';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleDateString('pt-BR');
}

export function municipioTexto(item, legado) {
    if (item?.municipio_nome) {
        return item.municipio_uf ? `${item.municipio_nome}/${item.municipio_uf}` : item.municipio_nome;
    }
    return legado ?? item?.municipio ?? '—';
}
