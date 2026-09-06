import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';
import App from './App.jsx'
import Layout from './components/layout/layout.jsx';
import Projetos from './components/projetos/seusprojetos/projetos.jsx';
import Bemvindo from './components/bemvindo/bemvindo.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element ={<Layout/>}>
          <Route path="/" element={<App/>} />
          <Route path="/Bemvindo" element={<Bemvindo />} />
          <Route path="/Projetos">
            <Route path="SeusProjetos" element={<Projetos />}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
