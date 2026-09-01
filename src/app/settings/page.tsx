'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  Database,
  Download,
  Monitor,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';

type SettingsSection = 'profile' | 'security' | 'dataset' | 'export' | 'system';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [defaultLimit, setDefaultLimit] = useState('25');
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const sections = [
    { id: 'profile' as SettingsSection, label: 'Profile', icon: User },
    { id: 'security' as SettingsSection, label: 'Security & Password', icon: Shield },
    { id: 'dataset' as SettingsSection, label: 'Dataset', icon: Database },
    { id: 'export' as SettingsSection, label: 'Export', icon: Download },
    { id: 'system' as SettingsSection, label: 'System', icon: Monitor },
  ];

  const handleResetDataset = async () => {
    if (!confirm('This will permanently delete all records. Are you sure?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/data', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dataset cleared from database');
        setNotification({ type: 'success', msg: 'Dataset reset successfully. All records deleted.' });
      } else {
        throw new Error('Reset failed');
      }
    } catch {
      toast.error('Failed to reset dataset');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/data/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Demo dataset seeded successfully!');
        setNotification({ type: 'success', msg: `${data.message || '2,123 records imported'}` });
      } else {
        throw new Error(data.error || 'Seeding failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Seeding failed');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      toast.success('Password updated successfully! Please use your new password next time.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotification({
        type: 'success',
        msg: 'Password has been updated securely. Event logged in system activity.',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = user?.name || 'Administrator';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-xs font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {notification.msg}
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar Tabs */}
        <aside className="md:w-60 shrink-0">
          <div className="p-2 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === s.id
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-5">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Profile Details
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-brand-500/20">
                  {initials}
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">{displayName}</h4>
                  <p className="text-xs text-gray-500">
                    {displayRole} &bull; @{user?.username || 'admin'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: displayName },
                  { label: 'Username ID', value: user?.username || 'admin' },
                  { label: 'Role', value: displayRole },
                  { label: 'Email', value: user?.email || 'admin@dataflow.io' },
                ].map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSection('security')}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Manage Security & Password
                </button>
              </div>
            </div>
          )}

          {/* Security & Password Section */}
          {activeSection === 'security' && (
            <div className="space-y-5">
              {/* Change Password Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand-600" /> Change Administrator Password
                  </h3>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> BCrypt Protected
                  </span>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Confirm New Password
                      </label>
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Active Session & Security Details Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active Session & Protections
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Current Browser Session</p>
                        <p className="text-[11px] text-gray-500">Authenticated via Secure HttpOnly JWT Token</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 space-y-1">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Brute-Force Guard</p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Active (Auto-lock after 5 attempts)
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 space-y-1">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Route Interceptor</p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Next.js Server Middleware Guard
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out From All Devices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dataset Management Section */}
          {activeSection === 'dataset' && (
            <div className="space-y-4">
              {/* Seed Demo Dataset Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-600" /> Seed Demo Dataset
                </h3>
                <p className="text-xs text-gray-500">
                  Generate a fresh demo dataset with 2,123 realistic business records across 10 Bangladesh districts. This will replace your existing dataset.
                </p>
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 disabled:opacity-60 transition-all"
                >
                  {isSeeding ? 'Seeding...' : '⚡ Seed 2,123 Demo Records'}
                </button>
              </div>

              {/* Reset Dataset Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Reset & Clear Dataset
                </h3>
                <p className="text-xs text-gray-500">
                  Permanently delete all records from the database. This action cannot be undone.
                </p>
                <button
                  onClick={handleResetDataset}
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold transition-all disabled:opacity-60"
                >
                  {isResetting ? 'Clearing...' : 'Clear All Records'}
                </button>
              </div>
            </div>
          )}

          {/* Export Preferences */}
          {activeSection === 'export' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-600" /> Export Preferences
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Default Rows Per Page
                  </label>
                  <select
                    value={defaultLimit}
                    onChange={(e) => setDefaultLimit(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Include Custom Fields in Export
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Adds extra metadata columns to CSV exports
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-600 transition-all">
                    <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white shadow transition-all" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => toast.success('Export preferences saved!')}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* System Section */}
          {activeSection === 'system' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-brand-600" /> System & Security Environment
              </h3>

              <div className="space-y-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Dark Mode
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Switch between light and dark interface theme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                      theme === 'dark' ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-all ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Version & Security Info */}
                <div className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-2 text-xs">
                  {[
                    { label: 'Application', value: 'DATAFLOW v1.0.0' },
                    { label: 'Auth Guard', value: 'Next.js Edge Middleware + JWT' },
                    { label: 'Password Encryption', value: 'BCrypt Salt-Rounds 10' },
                    { label: 'Database', value: 'MongoDB Atlas (Mongoose)' },
                    { label: 'Brute-Force Protection', value: 'Enabled (5 Max Attempts)' },
                    { label: 'Security Headers', value: 'X-Frame-Options, CSP, Nosniff' },
                  ].map((info) => (
                    <div key={info.label} className="flex justify-between">
                      <span className="text-gray-500">{info.label}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
