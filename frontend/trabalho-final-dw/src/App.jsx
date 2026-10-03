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
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill"></i> Sessão Expirada
                  </h5>
                </div>
                <div className="modal-body py-4 text-center">
                  <p className="mb-0 fs-6 text-secondary">
                    Sua sessão foi encerrada por inatividade. Por favor, faça login novamente para continuar.
                  </p>
                </div>
                <div className="modal-footer justify-content-center">
                  <button 
                    type="button" 
                    className="btn btn-primary px-4" 
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

          {/* Se a impressão não precisar da navbar/sidebar do sistema */}
          <Route path="/Projetos/:id/imprimir" element={<ImprimirProjeto />}/>
        </Route>
      </Routes>
    </>
  );
}

export default App;
