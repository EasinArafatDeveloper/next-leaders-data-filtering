'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{
    success: boolean;
    requires2FA?: boolean;
    twoFactorPendingToken?: string;
    username?: string;
    name?: string;
    error?: string;
  }>;
  verify2FA: (
    twoFactorPendingToken: string,
    code: string,
    isBackupCode?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      if (data.requires2FA) {
        return {
          success: true,
          requires2FA: true,
          twoFactorPendingToken: data.twoFactorPendingToken,
          username: data.username,
          name: data.name,
        };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'An unexpected network error occurred',
      };
    }
  };

  const verify2FA = async (
    twoFactorPendingToken: string,
    code: string,
    isBackupCode: boolean = false
  ) => {
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorPendingToken, code, isBackupCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during 2FA verification',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      toast.success('Signed out securely');
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verify2FA,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
