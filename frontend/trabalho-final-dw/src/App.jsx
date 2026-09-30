import { Routes, Route } from "react-router-dom";
import Inicial from './components/Inicial/inicial';
import LayoutAutenticated from './components/layout/layoutAutenticated.jsx';
import LayoutNotAutenticated from './components/layout/layoutNotAutenticated.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Projetos from './components/projetos/seusprojetos/projetos.jsx';
import CadastrarProjeto from './components/projetos/cadastrar_projeto/cadastrar_projeto.jsx';
import ImprimirProjeto from './components/projetos/imprimir/ImprimirProjeto.jsx';
import Bemvindo from './components/bemvindo/bemvindo.jsx';

function App() {
  return (
    <Routes>
      <Route element={<LayoutNotAutenticated />}>
        <Route path="/" element={<Inicial />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutAutenticated />}>
          <Route path="/Bemvindo" element={<Bemvindo />} />
          <Route path="/Projetos">
            <Route path="SeusProjetos" element={<Projetos />}/>
            <Route path="CadastrarProjeto" element={<CadastrarProjeto />}/>
            <Route path=":id/imprimir" element={<ImprimirProjeto />}/>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
