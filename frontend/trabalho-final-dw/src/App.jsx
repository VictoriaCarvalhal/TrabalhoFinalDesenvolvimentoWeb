import { Routes, Route, Navigate } from "react-router-dom";
import Inicial from './components/Inicial/inicial';
import EsqueciSenha from './components/EsqueciSenha/EsqueciSenha.jsx';
import RedefinirSenha from './components/RedefinirSenha/RedefinirSenha.jsx';
import LayoutAutenticated from './components/layout/layoutAutenticated.jsx';
import LayoutNotAutenticated from './components/layout/layoutNotAutenticated.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import CadastrarProjeto from './components/projetos/cadastrar_projeto/cadastrar_projeto.jsx';
import ImprimirProjeto from './components/projetos/imprimir/ImprimirProjeto.jsx';
import Bemvindo from './components/bemvindo/bemvindo.jsx';
import PeriodoAdmin from './components/admin/PeriodoAdmin.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import { ROTAS } from './utils/rotas.js';
import { useAuthStore } from './stores/authStore.jsx';
import { useAutoRefreshOnActivity } from './hooks/useAutoRefreshOnActivity';

function RotaInicial() {
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  return isAutenticado ? <Navigate to={ROTAS.BEMVINDO} replace /> : <Inicial />;
}

function App() {
  const { isSessionExpired, closeSessionExpiredModal } = useAutoRefreshOnActivity();

  return (
    <>
      {isSessionExpired && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 1055, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header bg-warning text-dark border-0">
                  <h5 className="modal-title d-flex align-items-center gap-2 fw-bold">
                    <i className="bi bi-exclamation-triangle-fill"></i> Sessão Expirada
                  </h5>
                </div>
                <div className="modal-body py-4 text-center">
                  <p className="mb-0 fs-6 text-secondary">
                    Sua sessão foi encerrada por inatividade. Por favor, faça login novamente para continuar.
                  </p>
                </div>
                <div className="modal-footer justify-content-center border-0 pb-4">
                  <button
                    type="button"
                    className="btn btn-primary px-4 fw-semibold"
                    onClick={closeSessionExpiredModal}
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

      <ScrollToTop />
      <Routes>
        <Route element={<LayoutNotAutenticated />}>
          <Route path={ROTAS.INICIAL} element={<RotaInicial />} />
          <Route path={ROTAS.ESQUECI_SENHA} element={<EsqueciSenha />} />
          <Route path={ROTAS.REDEFINIR_SENHA} element={<RedefinirSenha />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutAutenticated />}>
            <Route path={ROTAS.BEMVINDO} element={<Bemvindo />} />
            <Route path="/Admin/Periodo" element={<PeriodoAdmin />} />
            <Route path={ROTAS.PROJETOS}>
              <Route index element={<Navigate to={ROTAS.BEMVINDO} replace />} />
              <Route path="novo" element={<CadastrarProjeto />} />
              <Route path=":id/editar" element={<CadastrarProjeto />} />
              <Route path="seus-projetos" element={<Navigate to={ROTAS.BEMVINDO} replace />} />
              <Route path="SeusProjetos" element={<Navigate to={ROTAS.BEMVINDO} replace />} />
              <Route path="cadastrar-projeto" element={<Navigate to={ROTAS.NOVO_PROJETO} replace />} />
              <Route path="CadastrarProjeto" element={<Navigate to={ROTAS.NOVO_PROJETO} replace />} />
            </Route>
          </Route>

          <Route path="/projetos/:id/imprimir" element={<ImprimirProjeto />}/>
        </Route>
        <Route path="*" element={<Navigate to={ROTAS.INICIAL} replace />} />
      </Routes>
    </>
  );
}

export default App;
