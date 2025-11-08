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
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Archaeologist Auth Component */}
          <ArchaeologistAuth
            defaultMode="signin"
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SignIn;
