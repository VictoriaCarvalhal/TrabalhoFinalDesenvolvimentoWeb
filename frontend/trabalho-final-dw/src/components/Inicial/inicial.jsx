import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // 1. Importando a biblioteca

function Inicial() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const handleLogin = (data) => {
        console.log("Dados do formulário:", data); 
        navigate('/Bemvindo');
    }

    return (
        <div className="card" style={{ width: '350px' }}>
            <div className="card-body">
                <h5 className="card-title text-center">Login</h5>

                
                <form onSubmit={handleSubmit(handleLogin)}>

                    <div className="mb-3">
                        <label htmlFor="usuario" className="form-label">Usuário</label>
                        <input
                            type="text"
                            className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                            id="usuario"
                            {...register("usuario", { required: "O usuário é obrigatório" })}
                        />
                        {errors.usuario && <div className="invalid-feedback">{errors.usuario.message}</div>}
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
                        <button type="submit" className="btn btn-primary">Acessar</button>
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