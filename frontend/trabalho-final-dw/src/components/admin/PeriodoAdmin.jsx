import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getPeriodoConfig, atualizarPeriodo } from '../../services/periodoService';

// Página exclusiva de admin: altera as datas do período de extensão e
// abre/fecha a criação e a edição de projetos para usuários comuns.
function PeriodoAdmin() {
    const isAdmin = useAuthStore((state) => state.isAdmin);

    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [aberto, setAberto] = useState(true);
    const [mensagem, setMensagem] = useState('');
    const [abertoEfetivo, setAbertoEfetivo] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            setCarregando(false);
            return;
        }
        let cancelado = false;
        setCarregando(true);
        setErro(null);
        getPeriodoConfig()
            .then((periodo) => {
                if (cancelado) return;
                setInicio(periodo.inicio ?? '');
                setFim(periodo.fim ?? '');
                setAberto(Boolean(periodo.aberto));
                setMensagem(periodo.mensagem_fechado ?? '');
                setAbertoEfetivo(Boolean(periodo.aberto_efetivo));
            })
            .catch(() => {
                if (!cancelado) {
                    setErro('Não foi possível carregar o período. Tente novamente.');
                }
            })
            .finally(() => {
                if (!cancelado) {
                    setCarregando(false);
                }
            });
        return () => {
            cancelado = true;
        };
    }, [isAdmin]);

    // Comum não entra aqui nem pela URL direta.
    if (!isAdmin) {
        return <Navigate to="/Bemvindo" replace />;
    }

    async function handleSalvar(e) {
        e.preventDefault();
        setErro(null);
        setSucesso(false);
        if (inicio && fim && inicio > fim) {
            setErro('A data de fim precisa ser igual ou posterior ao início.');
            return;
        }
        setSalvando(true);
        try {
            const atualizado = await atualizarPeriodo({
                inicio,
                fim,
                aberto,
                mensagem_fechado: mensagem,
            });
            setAbertoEfetivo(Boolean(atualizado.aberto_efetivo));
            setSucesso(true);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(
                detalhe?.fim?.[0]
                ?? detalhe?.detail
                ?? 'Não foi possível salvar o período. Tente novamente.'
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="container mt-4 mb-5">
            <h1 className="h4">Período de extensão</h1>
            <p className="text-muted">
                Defina as datas e abra ou feche a criação e a edição de projetos.
            </p>

            {carregando && (
                <div className="d-flex align-items-center mt-3 text-muted" role="status">
                    <div className="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
                    <span>Carregando período...</span>
                </div>
            )}

            {erro && (
                <div className="alert alert-danger mt-3" role="alert">{erro}</div>
            )}

            {sucesso && (
                <div className="alert alert-success mt-3" role="status">
                    Período atualizado com sucesso.
                </div>
            )}

            {!carregando && (
                <>
                    {abertoEfetivo !== null && (
                        <div
                            className={`alert mt-3 ${abertoEfetivo ? 'alert-success' : 'alert-warning'}`}
                            role="status"
                        >
                            <i
                                className={`bi ${abertoEfetivo ? 'bi-unlock-fill' : 'bi-lock-fill'} me-2`}
                                aria-hidden="true"
                            ></i>
                            Status atual: <strong>{abertoEfetivo ? 'Aberto' : 'Fechado'}</strong>
                            {inicio && fim && (
                                <span> ({inicio.slice(8, 10)}/{inicio.slice(5, 7)}/{inicio.slice(0, 4)} a {fim.slice(8, 10)}/{fim.slice(5, 7)}/{fim.slice(0, 4)})</span>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSalvar} className="card card-body mt-3 shadow-sm">
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label" htmlFor="periodo-inicio">Início</label>
                                <input
                                    id="periodo-inicio"
                                    type="date"
                                    className="form-control"
                                    value={inicio}
                                    onChange={(e) => setInicio(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label" htmlFor="periodo-fim">Fim</label>
                                <input
                                    id="periodo-fim"
                                    type="date"
                                    className="form-control"
                                    value={fim}
                                    onChange={(e) => setFim(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-check form-switch mt-3">
                            <input
                                id="periodo-aberto"
                                type="checkbox"
                                className="form-check-input"
                                role="switch"
                                checked={aberto}
                                onChange={(e) => setAberto(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="periodo-aberto">
                                Período aberto (desligado, fica fechado mesmo dentro das datas)
                            </label>
                        </div>

                        <div className="mt-3">
                            <label className="form-label" htmlFor="periodo-mensagem">
                                Mensagem exibida quando fechado
                            </label>
                            <textarea
                                id="periodo-mensagem"
                                className="form-control"
                                rows={3}
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder="Ex.: Fora do período de extensão..."
                            />
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-primary" disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar período'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default PeriodoAdmin;
