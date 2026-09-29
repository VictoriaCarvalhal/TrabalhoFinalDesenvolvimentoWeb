import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Inicial from './components/Inicial/inicial';
import Bemvindo from './components/Bemvindo'; // Ajuste o caminho conforme onde estiver seu componente Bemvindo
import ProtectedRoute from './components/ProtectedRoute'; // O componente do Passo 1

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA PÚBLICA (Tela de Login) */}
        <Route path="/" element={<Inicial />} />

        {/* ROTAS PROTEGIDAS (Exigem autenticação) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/Bemvindo" element={<Bemvindo />} />
          {/* Outras páginas privadas entram aqui no futuro */}
        </Route>

        {/* Rota genérica para URLs inexistentes (manda de volta para o login) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
