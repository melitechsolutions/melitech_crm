import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: "super_admin" | "admin" | "staff" | "accountant" | "hr" | "user" | "client";
  loginMethod?: string;
}

/**
 * Enhanced auth hook with persistent login state
 * 
 * Features:
 * - Persists user data to localStorage as fallback when cookies fail
 * - Stores JWT token in localStorage for Docker/HTTP environments
 * - Handles hydration to prevent SSR mismatches
 * - Provides role-based routing information
 * - Automatic redirect on unauthenticated access
 */
export function useAuthWithPersistence(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [persistedUser, setPersistedUser] = useState<AuthUser | null>(null);
  const [persistedToken, setPersistedToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth-user");
    const storedToken = localStorage.getItem("auth-token");
    
    if (storedUser) {
      try {
        setPersistedUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("auth-user");
      }
    }
    
    if (storedToken) {
      setPersistedToken(storedToken);
    }
    
    setIsHydrated(true);
  }, []);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("auth-user");
      localStorage.removeItem("auth-token");
      setPersistedUser(null);
      setPersistedToken(null);
    },
  });

  const logout = useCallback(async () => {
    try {
      // Clear local state and cache FIRST
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("auth-user");
      localStorage.removeItem("auth-token");
      setPersistedUser(null);
      setPersistedToken(null);
      
      // Invalidate the query to clear any cached data
      await utils.auth.me.invalidate();
      
      // Then call the server logout endpoint
      await mutateAsync(logoutMutation);
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out on server, that's fine
      } else {
        throw error;
      }
    }
  }, [logoutMutation, utils]);

  // Update persisted user and token when meQuery data changes
  useEffect(() => {
    if (meQuery.data) {
      const userData: AuthUser = {
        id: meQuery.data.id,
        email: meQuery.data.email,
        name: meQuery.data.name,
        role: meQuery.data.role,
        loginMethod: meQuery.data.loginMethod,
      };
      localStorage.setItem("auth-user", JSON.stringify(userData));
      setPersistedUser(userData);
      
      // Store token if available (from login response)
      if (meQuery.data.token) {
        localStorage.setItem("auth-token", meQuery.data.token);
        setPersistedToken(meQuery.data.token);
      }
    } else if (!meQuery.isLoading && meQuery.data === null) {
      // User is not authenticated
      localStorage.removeItem("auth-user");
      localStorage.removeItem("auth-token");
      setPersistedUser(null);
      setPersistedToken(null);
    }
  }, [meQuery.data, meQuery.isLoading]);

  // Use backend user if available, otherwise use persisted user
  const user = meQuery.data || persistedUser;

  const state = useMemo(() => {
    return {
      user: user || null,
      loading: meQuery.isLoading || logoutMutation.isPending || !isHydrated,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    user,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    isHydrated,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending || !isHydrated) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    isHydrated,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
