import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
    children: React.ReactNode;
    /** Tipo de usuário que pode acessar: 'cliente', 'organizacao' ou undefined (qualquer autenticado) */
    tipoPermitido?: 'cliente' | 'organizacao';
}

export function PrivateRoute({ children, tipoPermitido }: PrivateRouteProps) {
    const location = useLocation();

    const token = localStorage.getItem('@App:token');
    const usuarioRaw = localStorage.getItem('@App:usuario');

    // Sem token → redireciona para login preservando a rota de destino
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se há restrição de tipo, valida o tipo do usuário
    if (tipoPermitido && usuarioRaw) {
        try {
            const usuario = JSON.parse(usuarioRaw);
            if (usuario.tipo !== tipoPermitido) {
                // Tipo errado → redireciona para a home
                return <Navigate to="/" replace />;
            }
        } catch {
            return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
}
