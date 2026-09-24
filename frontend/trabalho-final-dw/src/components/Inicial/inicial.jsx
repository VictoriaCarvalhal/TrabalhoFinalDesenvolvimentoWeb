import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

function Inicial() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [erroLogin, setErroLogin] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const handleLogin = async (data) => {
        setErroLogin(null);
        setEnviando(true);

        try {
            // Agora o formulário e o backend usam "cpf".
            const resposta = await api.post('/auth/login/', {
                cpf: data.cpf,
                password: data.senha,
            });

            login(resposta.data.access);
            // Guarda o refresh também, pra usar depois quando o access expirar.
            localStorage.setItem('refresh', resposta.data.refresh);

            navigate('/Bemvindo');
        } catch (err) {
            if (err.response?.status === 401) {
                setErroLogin('Usuário ou senha incorretos.');
            } else {
                setErroLogin('Não foi possível fazer login. Tente novamente.');
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="card" style={{ width: '350px' }}>
            <div className="card-body">
                <h5 className="card-title text-center">Login</h5>

                {erroLogin && (
                    <div className="alert alert-danger py-2" role="alert">
                        {erroLogin}
                    </div>
                )}

                <form onSubmit={handleSubmit(handleLogin)}>

                    <div className="mb-3">
                        <label htmlFor="cpf" name="cpf" className="form-label">CPF</label>
                        <input
                            type="text"
                            className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
                            id="cpf"
                            {...register("cpf", { required: "O CPF é obrigatório" })}
                        />
                        {errors.cpf && <div className="invalid-feedback">{errors.cpf.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="senha" name="senha" className="form-label">Senha</label>
                        <input
                            type="password"
                            className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
                            id="senha"
                            {...register("senha", { required: "A senha é obrigatória" })}
                        />
                        {errors.senha && <div className="invalid-feedback">{errors.senha.message}</div>}
                    </div>

                    <div className="text-end">
                        <button type="submit" className="btn btn-primary" disabled={enviando}>
                            {enviando ? 'Entrando...' : 'Acessar'}
                        </button>
                    </div>

                </form>

                <div className="d-flex justify-content-between mt-4">
                    <a href="#" className="card-link m-0">Esqueci a senha</a>
                    <a href="#" className="card-link m-0">Primeiro Acesso</a>
                </div>

            </div>
        </div>
    );
}

export default Inicial;