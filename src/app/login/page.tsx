'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both your Username and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(username.trim(), password);

    if (res.success) {
      toast.success('Authentication successful! Welcome back.');
      router.push(callbackUrl);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
      toast.error(res.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#F8FAFC] dark:bg-[#080C14] transition-colors duration-300">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 blur-[130px] dark:from-brand-600/15 dark:to-indigo-500/15" />
        <div className="absolute -bottom-[25%] -right-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/20 to-brand-500/20 blur-[130px] dark:from-indigo-600/15 dark:to-brand-500/15" />
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Bar: Theme Switcher & Security Status */}
      <header className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 flex items-center justify-between z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            Enterprise Security Active
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="p-7 sm:p-9 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-gray-200/90 dark:border-slate-800/90 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 space-y-6">
          {/* Brand & Security Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-brand-600/10 via-indigo-500/10 to-brand-400/10 border border-brand-500/20 shadow-inner">
              <img
                src="/Logo_Next_new.png"
                alt="Logo"
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Secure Dashboard Login
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your authorized credentials to access DATAFLOW
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 font-medium"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-base leading-none opacity-60 hover:opacity-100 font-bold"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / ID Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between"
              >
                <span>Username or Email ID</span>
              </label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between"
              >
                <span>Password</span>
              </label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Check note & Remember Me */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400 select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Remember session for 7 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all hover:shadow-brand-600/40 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 JWT
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-brand-500" /> HttpOnly Secure
            </span>
            <span>&bull;</span>
            <span>Brute-Force Guard</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#080C14]">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
