import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

function RedefinirSenha() {
    const [params] = useSearchParams();

    const uid = params.get('uid');
    const token = params.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    const alterarSenha = async (event) => {
        event.preventDefault();

        setMensagem('');
        setErro('');

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não são iguais.');
            return;
        }

        setEnviando(true);

        try {
            const resposta = await api.post(
                '/auth/password-reset/confirm/',
                {
                    uid: uid,
                    token: token,
                    nova_senha: novaSenha,
                    confirmar_senha: confirmarSenha
                }
            );

            setMensagem(resposta.data.mensagem);
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (err) {
            const resposta = err.response?.data;

            if (resposta?.erro) {
                setErro(resposta.erro);
            } else if (resposta?.nova_senha) {
                setErro(resposta.nova_senha.join(' '));
            } else {
                setErro('Não foi possível alterar a senha.');
            }
        } finally {
            setEnviando(false);
        }
    };

    if (!uid || !token) {
        return (
            <div className="card" style={{ width: '350px' }}>
                <div className="card-body">
                    <h5 className="card-title text-center">
                        Recuperar senha
                    </h5>

                    <div className="alert alert-danger">
                        Link de recuperação inválido.
                    </div>

                    <Link to="/">
                        Voltar para o login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ width: '350px' }}>
            <div className="card-body">
                <h5 className="card-title text-center">
                    Nova senha
                </h5>

                {mensagem && (
                    <div className="alert alert-success py-2">
                        {mensagem}
                    </div>
                )}

                {erro && (
                    <div className="alert alert-danger py-2">
                        {erro}
                    </div>
                )}

                {!mensagem && (
                    <form onSubmit={alterarSenha}>
                        <div className="mb-3">
                            <label
                                htmlFor="novaSenha"
                                className="form-label"
                            >
                                Nova senha
                            </label>

                            <input
                                type="password"
                                id="novaSenha"
                                className="form-control"
                                value={novaSenha}
                                onChange={(event) => setNovaSenha(event.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="confirmarSenha"
                                className="form-label"
                            >
                                Confirme a nova senha
                            </label>

                            <input
                                type="password"
                                id="confirmarSenha"
                                className="form-control"
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="text-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={enviando}
                            >
                                {enviando ? 'Salvando...' : 'Alterar senha'}
                            </button>
                        </div>
                    </form>
                )}

                {mensagem && (
                    <div className="text-center mt-3">
                        <Link to="/">
                            Voltar para o login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RedefinirSenha;
