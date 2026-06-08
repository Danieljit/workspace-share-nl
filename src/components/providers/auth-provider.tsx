"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// Public hook API — kept stable so existing consumers don't need to change.
type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  signOut: () => {},
  signIn: async () => false,
});

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Backs the `useAuth()` hook with the real Auth.js session. Components keep the
 * same `{ isAuthenticated, user, isLoading, signIn, signOut }` shape they used
 * with the previous mock provider.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return !!result && !result.error;
  };

  const signOut = () => {
    void nextAuthSignOut({ redirect: false }).then(() => {
      router.push("/");
      router.refresh();
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: status === "authenticated",
        user,
        isLoading: status === "loading",
        error: null,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
