"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define the auth context type
type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  signOut: () => {},
  signIn: async () => false,
});

// Auth provider props type
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate auth loading and set a default user for development
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For development, we'll just set a mock user
        // In production, this would check the actual auth state
        setTimeout(() => {
          setUser({
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
            image: "https://randomuser.me/api/portraits/lego/1.jpg",
          });
          setIsAuthenticated(true);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError("Authentication error");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign out function
  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    router.push("/");
  };

  // Sign in function (mock for development)
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication for development
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (email && password.length >= 6) {
        setUser({
          id: "1",
          name: "Demo User",
          email: email,
          image: "https://randomuser.me/api/portraits/lego/1.jpg",
        });
        setIsAuthenticated(true);
        setError(null);
        setIsLoading(false);
        return true;
      } else {
        setError("Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError("Authentication failed");
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
