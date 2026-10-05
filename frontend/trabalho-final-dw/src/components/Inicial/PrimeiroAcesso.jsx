import React, { useState } from 'react';
import api from '../../services/api';
import DialogoFormulario from '../projetos/cadastrar_projeto/DialogoFormulario';

function PrimeiroAcesso({ aoFechar, aoConcluir }) {
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [lattes, setLattes] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const preenchido = nomeCompleto.trim() && cpf.trim() && email.trim() && senha && confirmarSenha;

    const handleCpfChange = (e) => {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length > 9) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        } else if (valor.length > 6) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (valor.length > 3) {
            valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }

        setCpf(valor);
    };

    async function cadastrarUsuario() {
        setErro(null);

        if (senha !== confirmarSenha) {
            setErro('As senhas não conferem.');
            return;
        }

        setEnviando(true);
        try {
            await api.post('/auth/register/', {
                nome_completo: nomeCompleto,
                cpf: cpf.replace(/\D/g, ''), // Envia apenas os números
                email_institucional: email,
                lattes_url: lattes,
                password: senha,
            });
            aoConcluir(cpf.replace(/\D/g, ''), 'Cadastro realizado com sucesso. Você já pode fazer login.');
        } catch (err) {
            const dados = err.response?.data;
            if (dados) {
                setErro(Object.values(dados).flat().join(' '));
            } else {
                setErro('Não foi possível realizar o cadastro. Verifique os dados e tente novamente.');
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <DialogoFormulario
            titulo="Cadastrar-se"
            aoSalvar={cadastrarUsuario}
            aoFechar={aoFechar}
            salvarDesabilitado={!preenchido || enviando}
            erro={erro}
        >
            <div className="mb-3">
                <label className="form-label" htmlFor="cad-nome">Nome Completo *</label>
                <input
                    id="cad-nome"
                    type="text"
                    className="form-control"
                    value={nomeCompleto}
                    required
                    onChange={(e) => setNomeCompleto(e.target.value)}
                />
            </div>

            <div className="row g-2 mb-3">
                <div className="col-sm-6">
                    <label className="form-label" htmlFor="cad-cpf">CPF *</label>
                    <input
                        id="cad-cpf"
                        type="text"
                        className="form-control"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        maxLength="14"
                        value={cpf}
                        required
                        onChange={handleCpfChange}
                    />
                </div>
                <div className="col-sm-6">
                    <label className="form-label" htmlFor="cad-email">E-mail Institucional *</label>
                    <input
                        id="cad-email"
                        type="email"
                        className="form-control"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="cad-lattes">Link do Currículo Lattes</label>
                <input
                    id="cad-lattes"
                    type="url"
                    className="form-control"
                    placeholder="Opcional"
                    value={lattes}
                    onChange={(e) => setLattes(e.target.value)}
                />
            </div>

            <div className="row g-2">
                <div className="col-sm-6 mb-3">
                    <label className="form-label" htmlFor="cad-senha">Senha *</label>
                    <input
                        id="cad-senha"
                        type="password"
                        className="form-control"
                        minLength={8}
                        value={senha}
                        required
                        onChange={(e) => setSenha(e.target.value)}
                    />
                    <div className="form-text">Mínimo de 8 caracteres.</div>
                </div>
                <div className="col-sm-6 mb-3">
                    <label className="form-label" htmlFor="cad-confirmar">Confirme a senha *</label>
                    <input
                        id="cad-confirmar"
                        type="password"
                        className="form-control"
                        minLength={8}
                        value={confirmarSenha}
                        required
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                </div>
            </div>
        </DialogoFormulario>
    );
}

export default PrimeiroAcesso;
