/**
 * Firebase Sign Up Page Component
 *
 * This component handles Firebase user registration with the following features:
 * - Email/password registration
 * - Google OAuth registration
 * - Automatic sign-in after successful registration
 * - Form validation and error handling
 *
 * Routes: /authentication/sign-up
 */

import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ArchaeologistAuth } from "@/components/ArchaeologistAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to visit before being redirected to sign-up
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
              defaultMode="signup"
              onAuthSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SignUp;
