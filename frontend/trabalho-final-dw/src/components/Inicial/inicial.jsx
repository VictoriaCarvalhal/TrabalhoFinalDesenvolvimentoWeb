import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { ROTAS } from '../../utils/rotas.js';
import api from '../../services/api';
import PrimeiroAcesso from './PrimeiroAcesso';

function Inicial() {
    const navigate = useNavigate();
    
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const setNomeUsuario = useAuthStore((state) => state.setNomeUsuario);
    const setAdmin = useAuthStore((state) => state.setAdmin);
    const setPerfil = useAuthStore((state) => state.setPerfil);

    const [erroLogin, setErroLogin] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [mostrarPrimeiroAcesso, setMostrarPrimeiroAcesso] = useState(false);
    const [sucessoPrimeiroAcesso, setSucessoPrimeiroAcesso] = useState(null);
    // O motivo fica guardado até o próximo login dar certo, então o aviso
    // sobrevive a um F5 na tela de login.
    const [avisoSessao] = useState(() =>
        sessionStorage.getItem('motivoLogout') === 'inatividade'
            ? 'Sua sessão foi encerrada por inatividade. Entre de novo para continuar.'
            : null
    );

    useEffect(() => {
        if (isAutenticado) {
            navigate('/Bemvindo', { replace: true });
        }
    }, [isAutenticado, navigate]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();

    const handleLogin = async (data) => {
        setErroLogin(null);
        setEnviando(true);

        const cpfLimpo = data.cpf.replace(/\D/g, '');

        try {
            const resposta = await api.post('/auth/login/', {
                cpf: cpfLimpo,
                password: data.senha,
            });

            login(resposta.data.access, resposta.data.refresh);

            const perfil = await api.get('/auth/me/');
            
            setNomeUsuario(perfil.data.nome_completo);
            setAdmin(perfil.data.is_staff || perfil.data.is_superuser);
            setPerfil(perfil.data.perfil);

            sessionStorage.removeItem('motivoLogout');
            navigate(ROTAS.BEMVINDO);
        } catch (err) {
            logout();
            setValue('senha', '');

            if (err.response?.status === 401) {
                setErroLogin('CPF ou senha incorretos.');
            } else {
                setErroLogin('Não foi possível fazer login. Tente novamente.');
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="card" style={{ width: '350px' }}>
            <div className="card-body">
                <h5 className="card-title text-center">Login</h5>

                {avisoSessao && (
                    <div className="alert alert-warning py-2" role="status">
                        {avisoSessao}
                    </div>
                )}

                {erroLogin && (
                    <div className="alert alert-danger py-2" role="alert">
                        {erroLogin}
                    </div>
                )}

                {sucessoPrimeiroAcesso && (
                    <div className="alert alert-success py-2" role="status">
                        {sucessoPrimeiroAcesso}
                    </div>
                )}

                <form onSubmit={handleSubmit(handleLogin)}>

                    <div className="mb-3">
                        <label htmlFor="cpf" className="form-label">CPF</label>
                        <input
                            type="text"
                            className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
                            id="cpf"
                            {...register("cpf", { required: "O CPF é obrigatório" })}
                        />
                        {errors.cpf && <div className="invalid-feedback">{errors.cpf.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="senha" className="form-label">Senha</label>
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
                    <Link to={ROTAS.ESQUECI_SENHA} className="card-link m-0">Esqueci a senha</Link>
                    <a
                        href="#"
                        className="card-link m-0"
                        onClick={(e) => {
                            e.preventDefault();
                            setMostrarPrimeiroAcesso(true);
                        }}
                    >
                        Primeiro Acesso
                    </a>
                </div>

            </div>

            {mostrarPrimeiroAcesso && (
                <PrimeiroAcesso
                    aoFechar={() => setMostrarPrimeiroAcesso(false)}
                    aoConcluir={(cpf, mensagem) => {
                        setMostrarPrimeiroAcesso(false);
                        setSucessoPrimeiroAcesso(mensagem);
                        setErroLogin(null);
                        setValue('cpf', cpf);
                    }}
                />
            )}
        </div>
    );
}

export default Inicial;
