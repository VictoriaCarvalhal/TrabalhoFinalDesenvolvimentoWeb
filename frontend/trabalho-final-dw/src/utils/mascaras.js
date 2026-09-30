/**
 * Aplica máscara de telefone brasileiro (fixo 10 dígitos ou celular 11 dígitos).
 * Exemplos:
 * 10 dígitos: (84) 3333-4444
 * 11 dígitos: (84) 98888-5555
 */
export function aplicarMascaraTelefone(valor) {
    if (!valor) return '';
    const digitos = valor.replace(/\D/g, '').slice(0, 11);

    if (digitos.length <= 2) {
        return digitos ? `(${digitos}` : '';
    }
    if (digitos.length <= 6) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }
    if (digitos.length <= 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/**
 * Formata campo de e-mail (remove espaços em branco e converte para minúsculas).
 */
export function formatarEmail(valor) {
    if (!valor) return '';
    return valor.toLowerCase().replace(/\s/g, '');
}

/**
 * Valida se o formato do e-mail é válido.
 * Retorna true se estiver vazio (opcional) ou se corresponder ao padrão usuario@dominio.ext.
 */
export function validarEmail(email) {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida se o telefone tem a quantidade correta de dígitos (10 para fixo ou 11 para celular).
 * Retorna true se estiver vazio (opcional) ou se tiver 10 ou 11 dígitos.
 */
export function validarTelefone(telefone) {
    if (!telefone) return true;
    const digitos = telefone.replace(/\D/g, '');
    return digitos.length === 10 || digitos.length === 11;
}
