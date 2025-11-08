import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArchaeologistService } from '@/services/archaeologists';
import { Loader2, Mail, Lock, Chrome, GraduationCap, Shield } from 'lucide-react';

interface FirebaseAuthProps {
  onAuthSuccess?: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const FirebaseAuth: React.FC<FirebaseAuthProps> = ({
  onAuthSuccess,
  defaultMode = 'signin'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(defaultMode === 'signup');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        title: "Error",
        description: "Firebase authentication is not initialized",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up:", userCredential.user);
      toast({
        title: "Success!",
        description: "Account created successfully. Welcome!",
      });
      onAuthSuccess?.();
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        title: "Error",
        description: "Firebase authentication is not initialized",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in:", userCredential.user);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account",
      });
      onAuthSuccess?.();
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Error",
        description: "Firebase authentication is not initialized",
        variant: "destructive"
      });
      return;
    }

    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in success:", result.user);
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google",
      });
      onAuthSuccess?.();
    } catch (error: any) {
      console.error("Error with Google sign in:", error.message);
      toast({
        title: "Google Sign In Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    if (!auth) {
      toast({
        title: "Error",
        description: "Firebase authentication is not initialized",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{isSigningUp ? 'Create Account' : 'Sign In'}</CardTitle>
        <CardDescription>
          {isSigningUp
            ? 'Join our archaeological community'
            : 'Welcome back to ArchePal'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={isSigningUp ? handleSignUp : handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSigningUp ? "Password (min. 6 characters)" : "Enter your password"}
                className="pl-10"
                minLength={isSigningUp ? 6 : undefined}
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSigningUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSigningUp ? 'Sign Up' : 'Sign In'
            )}
          </Button>
        </form>

        {!isSigningUp && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={handlePasswordReset}
              className="text-sm"
              disabled={loading || resetEmailSent}
            >
              {resetEmailSent ? 'Reset email sent!' : 'Forgot password?'}
            </Button>
          </div>
        )}

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full"
          disabled={loading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="text-sm"
            disabled={loading}
          >
            {isSigningUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirebaseAuth;