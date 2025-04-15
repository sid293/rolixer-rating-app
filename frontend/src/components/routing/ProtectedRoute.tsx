import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'ADMIN' | 'USER' | 'STORE_OWNER'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  // console.log("protectedrouter : ", isAuthenticated, user)
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log("redirecting to appropriate dashboard based on user role")
    // Redirect to appropriate dashboard based on user role
    const dashboardRoutes = {
      ADMIN: '/admin/dashboard',
      USER: '/dashboard',
      STORE_OWNER: '/store/dashboard',
    };
    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }

  return <>{children}</>;
}