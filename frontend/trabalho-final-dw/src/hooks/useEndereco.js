const buscarCepNoFormulario = async (cep) => {
    const digits = cep.replace(/\D/g, '');

    if (digits.length !== 8) return;

    setBuscandoCep(true);
    setAvisoCep(null);

    try {
        const data = await buscarCep(cep);

        if (!data) {
            setAvisoCep('CEP não encontrado.');
            return;
        }

        const codigo = Number(data.ibge);

        const municipioDoRio = MUNICIPIOS_RJ.some(
            (m) => m.codigo === codigo
        );

        if (!municipioDoRio) {
            setAvisoCep(
                data.localidade
                    ? `O CEP ${digits} é de ${data.localidade}/${data.uf}, fora dos municípios do RJ.`
                    : 'O CEP não corresponde a um município do RJ.'
            );
        }

        setForm((f) => ({
            ...f,
            municipio: municipioDoRio ? String(codigo) : '',
            bairro: data.bairro || f.bairro,
            logradouro: data.logradouro || f.logradouro,
        }));
    } catch {
    } finally {
        setBuscandoCep(false);
    }
};
