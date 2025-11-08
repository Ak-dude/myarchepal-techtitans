/**
 * Firebase Sign In Page Component
 *
 * This component handles Firebase authentication with the following features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Password reset functionality
 * - Automatic redirection after successful login
 *
 * Routes: /authentication/sign-in
 */

import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ArchaeologistAuth } from "@/components/ArchaeologistAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to visit before being redirected to sign-in
  const from = location.state?.from?.pathname || "/";

  const handleAuthSuccess = () => {
    // Navigate back to the page they were trying to access, or home
    navigate(from, { replace: true });
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          {/* Header with Logo */}
          <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
            <PageHeader />
          </header>

          {/* Auth Content */}
          <div className="p-4 pt-8">
            <ArchaeologistAuth
              defaultMode="signin"
              onAuthSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SignIn;
