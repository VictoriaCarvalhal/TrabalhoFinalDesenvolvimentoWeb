import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

function ProtectedRoute({ apenasAdmin = false }) {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const isAdmin = useAuthStore((state) => state.isAdmin);

    // 1. Se não estiver autenticado, redireciona para a tela de login
    if (!isAutenticado) {
        return <Navigate to="/" replace />;
    }

    // 2. Se a rota exigir privilégios de Admin e o usuário não for Admin
    if (apenasAdmin && !isAdmin) {
        // Redireciona para a página inicial protegida ou exibe tela de não autorizado
        return <Navigate to="/Bemvindo" replace />;
    }

    // 3. Se passou em todas as verificações, renderiza as rotas filhas
    return <Outlet />;
}

export default ProtectedRoute;
