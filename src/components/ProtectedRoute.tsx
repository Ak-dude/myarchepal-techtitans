import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/authentication/sign-in',
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated, redirect to sign in
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route doesn't require auth but user is authenticated (e.g., login page), redirect to home
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // User has proper access, render the component
  return <>{children}</>;
};

export default ProtectedRoute;