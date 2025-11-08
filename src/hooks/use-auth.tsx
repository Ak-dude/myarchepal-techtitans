/**
 * Authentication Context and Hook
 * 
 * Provides global authentication state management throughout the application.
 * 
 * Features:
 * - Global user state accessible from any component
 * - Automatic loading of user from localStorage on mount
 * - User refresh functionality to sync state
 * - Logout functionality
 * 
 * Usage:
 * Wrap your app with <AuthProvider> and use useAuth() hook in components
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: FirebaseUser | null;             // Current authenticated user (null if not logged in)
  isAuthenticated: boolean;              // Whether user is currently authenticated
  isLoading: boolean;                    // Whether auth state is being loaded
  refreshUser: () => void;               // Function to refresh user from Firebase
  logout: () => Promise<void>;           // Function to sign out current user
}

// Create React context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state to all child components.
 * Automatically loads user from localStorage on mount.
 * 
 * @param children - Child components that need access to auth context
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State for current user
  const [user, setUser] = useState<FirebaseUser | null>(null);
  // State for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Loading state (true while checking Firebase auth state)
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh user state from Firebase
   * This is automatically handled by onAuthStateChanged
   */
  const refreshUser = () => {
    // Firebase auth state is managed automatically
    // This function exists for API compatibility
  };

  /**
   * Log out current user
   * Signs out from Firebase and updates component state
   */
  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
        console.log('✅ User signed out successfully');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? 'Signed in' : 'Signed out');
      if (firebaseUser) {
        console.log('👤 User details:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified
        });
      }
      setUser(firebaseUser);
      setIsAuthenticated(!!firebaseUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Provide auth context to all children
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context
 * Must be used within an AuthProvider component
 * 
 * @returns AuthContextType - Authentication state and functions
 * @throws Error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

