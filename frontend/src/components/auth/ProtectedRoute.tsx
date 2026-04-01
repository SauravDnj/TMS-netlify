import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  requiredRoles = []
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasAnyPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermissions.length > 0 && !hasAnyPermission(...requiredPermissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role.name)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
