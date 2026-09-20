import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';
import App from './App.jsx'
import LayoutAutenticated from './components/layout/layoutAutenticated.jsx';
import LayoutNotAutenticated from './components/layout/layoutNotAutenticated.jsx';
import Projetos from './components/projetos/seusprojetos/projetos.jsx';
import ParceriasInternas from './components/projetos/seusprojetos/parceriasInternas.jsx';
import Bemvindo from './components/bemvindo/bemvindo.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutNotAutenticated />}>
          <Route path="/" element={<App />} />
        </Route>
        <Route element={<LayoutAutenticated />}>
          <Route path="/Bemvindo" element={<Bemvindo />} />
          <Route path="/Projetos">
            <Route path="SeusProjetos" element={<Projetos />}/>
            <Route path="ParceriasInternas" element={<ParceriasInternas />}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
