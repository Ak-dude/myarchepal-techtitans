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
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            defaultMode="signup"
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SignUp;
