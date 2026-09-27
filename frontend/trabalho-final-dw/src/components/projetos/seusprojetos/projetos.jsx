import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

function Projetos() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);

    const [projetos, setProjetos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    function redirecionaProCadastro(){
        navigate('/Projetos/CadastrarProjeto');
    }

    useEffect(() => {
        // Sem token não tem nem por que chamar a API.
        if (!isAutenticado) {
            setCarregando(false);
            return;
        }

        async function buscarProjetos() {
            try {
                setCarregando(true);
                setErro(null);

                // O token já é injetado automaticamente pelo interceptor do api.js.
                const resposta = await api.get('/projetos/');
                const dados = resposta.data;

                // A API pagina a resposta (PAGE_SIZE: 20), então os itens vêm em "results".
                setProjetos(Array.isArray(dados) ? dados : dados.results ?? []);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setErro('Você precisa estar logado para ver seus projetos.');
                } else {
                    setErro(err.response?.data?.detail ?? 'Erro ao buscar projetos.');
                }
            } finally {
                setCarregando(false);
            }
        }

        buscarProjetos();
    }, [isAutenticado]);

    return (
        <div className="container mt-4">
            <h1>Seus Projetos</h1>
            {/*Botão p cadastrar um novo projeto, que redireciona para a aba de 'Cadastrar Projetos'*/}
            <button onClick={redirecionaProCadastro}>Novo Projeto</button>
            {!isAutenticado && (
                <div className="alert alert-warning mt-3">
                    Você precisa estar logado para ver seus projetos.
                </div>
            )}

            {isAutenticado && carregando && (
                <p className="mt-3">Carregando projetos...</p>
            )}

            {isAutenticado && !carregando && erro && (
                <div className="alert alert-danger mt-3">{erro}</div>
            )}

            {isAutenticado && !carregando && !erro && projetos.length === 0 && (
                <p className="mt-3">Você ainda não tem projetos cadastrados.</p>
            )}

            {isAutenticado && !carregando && !erro && projetos.length > 0 && (
                <table className="table table-striped table-hover mt-3">
                    <thead>
                        <tr>
                            <th>Ano</th>
                            <th>Número</th>
                            <th>Título</th>
                            <th>Situação</th>
                            <th>Unidade</th>
                            <th>Coordenador(a)</th>
                            <th>Atualizado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projetos.map((projeto) => (
                            <tr key={projeto.id}>
                                <td>{projeto.ano}</td>
                                <td>{projeto.numero ?? 'S/N'}</td>
                                <td>{projeto.titulo}</td>
                                <td>{projeto.situacao_display}</td>
                                <td>{projeto.unidade_sigla}</td>
                                <td>{projeto.coordenador_nome}</td>
                                <td>
                                    {projeto.updated_at
                                        ? new Date(projeto.updated_at).toLocaleDateString('pt-BR')
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Projetos;
