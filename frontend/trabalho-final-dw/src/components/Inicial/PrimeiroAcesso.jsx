import React, { useState } from 'react';
import api from '../../services/api';
import DialogoFormulario from '../projetos/cadastrar_projeto/DialogoFormulario';

// Pop-up de "Primeiro Acesso" da tela de login.
// A pessoa já está cadastrada pela universidade, mas ainda não tem senha:
// ela confirma quem é (CPF + matrícula ou e-mail) e cria a senha.
// Quem confere os dados no banco é o backend (POST /auth/primeiro-acesso/).
function PrimeiroAcesso({ aoFechar, aoConcluir }) {
    const [cpf, setCpf] = useState('');
    const [identificacao, setIdentificacao] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const preenchido = cpf.trim() && identificacao.trim() && novaSenha && confirmarSenha;

    async function criarSenha() {
        setErro(null);

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não são iguais.');
            return;
        }

        setEnviando(true);
        try {
            const resposta = await api.post('/auth/primeiro-acesso/', {
                cpf,
                identificacao,
                nova_senha: novaSenha,
                confirmar_senha: confirmarSenha,
            });
            aoConcluir(cpf, resposta.data.mensagem);
        } catch (err) {
            const dados = err.response?.data;
            if (err.response?.status === 429) {
                setErro('Muitas tentativas. Aguarde um pouco e tente de novo.');
            } else if (dados?.erro) {
                setErro(dados.erro);
            } else if (dados) {
                setErro(Object.values(dados).flat().join(' '));
            } else {
                setErro('Não foi possível concluir o primeiro acesso. Tente novamente.');
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <DialogoFormulario
            titulo="Primeiro acesso"
            aoSalvar={criarSenha}
            aoFechar={aoFechar}
            salvarDesabilitado={!preenchido || enviando}
            erro={erro}
        >
            <p className="small text-body-secondary">
                Use esta opção se você já tem cadastro na universidade mas ainda não
                criou sua senha no sistema.
            </p>

            <div className="mb-3">
                <label className="form-label" htmlFor="pa-cpf">CPF *</label>
                <input
                    id="pa-cpf"
                    type="text"
                    className="form-control"
                    inputMode="numeric"
                    value={cpf}
                    required
                    onChange={(e) => setCpf(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="pa-identificacao">Matrícula ou e-mail institucional *</label>
                <input
                    id="pa-identificacao"
                    type="text"
                    className="form-control"
                    placeholder="Ex: 202520402012"
                    value={identificacao}
                    required
                    onChange={(e) => setIdentificacao(e.target.value)}
                />
                <div className="form-text">Serve para confirmar que o CPF é seu.</div>
            </div>

            <div className="row g-2">
                <div className="col-sm-6 mb-3">
                    <label className="form-label" htmlFor="pa-senha">Nova senha *</label>
                    <input
                        id="pa-senha"
                        type="password"
                        className="form-control"
                        minLength={8}
                        value={novaSenha}
                        required
                        onChange={(e) => setNovaSenha(e.target.value)}
                    />
                    <div className="form-text">Mínimo de 8 caracteres.</div>
                </div>
                <div className="col-sm-6 mb-3">
                    <label className="form-label" htmlFor="pa-confirmar">Confirme a senha *</label>
                    <input
                        id="pa-confirmar"
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
