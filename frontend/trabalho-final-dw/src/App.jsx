import { Routes, Route } from "react-router-dom";
import Inicial from './components/Inicial/inicial';
import LayoutAutenticated from './components/layout/layoutAutenticated.jsx';
import LayoutNotAutenticated from './components/layout/layoutNotAutenticated.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Projetos from './components/projetos/seusprojetos/projetos.jsx';
import CadastrarProjeto from './components/projetos/cadastrar_projeto/cadastrar_projeto.jsx';
import ImprimirProjeto from './components/projetos/imprimir/ImprimirProjeto.jsx';
import Bemvindo from './components/bemvindo/bemvindo.jsx';
import { useAutoRefreshOnActivity } from './hooks/useAutoRefreshOnActivity';

function App() {
  const { isSessionExpired, closeSessionExpiredModal } = useAutoRefreshOnActivity();

  return (
    <>
      {/* Pop-up do Bootstrap para Sessão Expirada */}
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
          {/* Backdrop travando a interação com a tela de fundo */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

      <Routes>
        {/* Rotas Públicas */}
        <Route element={<LayoutNotAutenticated />}>
          <Route path="/" element={<Inicial />} />
        </Route>

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutAutenticated />}>
            <Route path="/Bemvindo" element={<Bemvindo />} />
            <Route path="/Projetos">
              <Route path="SeusProjetos" element={<Projetos />}/>
              <Route path="CadastrarProjeto" element={<CadastrarProjeto />}/>
            </Route>
          </Route>

          {/* Rota de Impressão sem Navbars/Sidebars */}
          <Route path="/Projetos/:id/imprimir" element={<ImprimirProjeto />}/>
        </Route>
      </Routes>
    </>
  );
}

export default App;
