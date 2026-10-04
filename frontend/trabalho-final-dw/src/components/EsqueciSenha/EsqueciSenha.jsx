import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function EsqueciSenha() {
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    const enviarEmail = async (event) => {
        event.preventDefault();

        setMensagem('');
        setErro('');
        setEnviando(true);

        try {
            const resposta = await api.post('/auth/password-reset/', {
                email: email
            });

            setMensagem(resposta.data.mensagem);
            setEmail('');
        } catch (err) {
            const detalhe = err.response?.data?.email?.join(' ')
                || err.response?.data?.detail;
            setErro(detalhe || 'Não foi possível solicitar a recuperação de senha.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="card" style={{ width: '350px' }}>
            <div className="card-body">
                <h5 className="card-title text-center">
                    Recuperar senha
                </h5>

                <p className="text-muted">
                    Informe seu e-mail institucional para receber o link de recuperação.
                </p>

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

                <form onSubmit={enviarEmail}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            E-mail institucional
                        </label>

                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <Link to="/">
                            Voltar
                        </Link>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={enviando}
                        >
                            {enviando ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EsqueciSenha;
