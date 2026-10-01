import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

function ProtectedRoute() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);

    // Se estiver autenticado, rendeiriza as rotas filhas (<Outlet />).
    // Se NÃO estiver, redireciona para a rota "/" (ou "/login") substituindo o histórico.
    return isAutenticado ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
