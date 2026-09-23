import React from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useNavigate } from 'react-router-dom';

function Projetos() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    function redirecionaProCadastro(){
        navigate('/Projetos/CadastrarProjeto');
    }

    return (
        <div className="container mt-4">
            <h1>Projetos</h1>
            {/* Codigo para testar a autenticacao mockada. Use isso para já programar a logica de mostrar os projetos de um especifico usuario.
             Dessa forma quando o codigo do backend estiver pronto só precisamos adaptar e não criar do zero*/}

            
            {/*Botão p cadastrar um novo projeto, que redireciona para a aba de 'Cadastrar Projetos'*/}
            <button onClick={redirecionaProCadastro}>Novo Projeto</button>
            <div className="mt-4 p-3 border rounded bg-light">
                <h4 className="text-primary">Status do Zustand (Mock):</h4>
                <p>
                    <strong>Usuário logado? </strong>
                    {isAutenticado ? "Sim 🟢" : "Não 🔴"}
                </p>
                <p>
                    <strong>Token salvo: </strong>
                    {token ? token : "Nenhum token encontrado"}
                </p>
            </div>
        </div>
    );
}

export default Projetos;