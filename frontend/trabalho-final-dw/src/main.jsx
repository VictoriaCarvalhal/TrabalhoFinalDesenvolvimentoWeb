import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';
import App from './App.jsx'
import Layout from './components/layout/layout.jsx';
import Projetos from './components/projetos/projetos.jsx';
import EmProducao from './components/emProducao/emProducao.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element ={<Layout/>}>
          <Route path="/" element={<App/>} />
          <Route path="/Projetos" element={<Projetos/>} />
          <Route path="/EmProducao" element={<EmProducao/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
