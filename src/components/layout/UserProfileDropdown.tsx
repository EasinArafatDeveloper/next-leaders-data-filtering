'use client';

import React, { useState } from 'react';
import { User, Settings, LogOut, ShieldCheck, ChevronUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';

interface UserProfileDropdownProps {
  isCollapsed?: boolean;
}

export function UserProfileDropdown({ isCollapsed = false }: UserProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Administrator';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  const handleSignOut = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center ${
          isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
        } rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700/50`}
        title={isCollapsed ? `${displayName} (${displayRole})` : undefined}
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand-500/20 shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
                {displayName}
              </h4>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" /> {displayRole}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronUp
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {open && (
        <div
          className={`absolute bottom-full ${
            isCollapsed ? 'left-14 w-52' : 'left-0 w-full'
          } mb-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {isCollapsed && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white">{displayName}</p>
              <p className="text-[10px] text-brand-600 dark:text-brand-400">{displayRole}</p>
            </div>
          )}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <User className="w-4 h-4 text-gray-400" /> My Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4 text-gray-400" /> Security & Password
          </Link>
          <div className="my-1 border-t border-gray-100 dark:border-slate-800" />
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
