'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lock,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Search,
  Users,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  KeyRound,
  EyeOff,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SharedRecord {
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  location?: string;
  area?: string;
  avatarUrl?: string;
  avatarType?: string;
  status?: string;
  activeDays?: number;
  tags?: string[];
  category?: string;
  customFields?: Record<string, any>;
}

interface ShareData {
  title: string;
  recordCount: number;
  records: SharedRecord[];
  isBurned: boolean;
  isOneTime: boolean;
  expiresAt: string;
  createdBy: string;
  sessionWatermark: string;
  accessedAt: string;
}

export default function SecureSharePage({ params }: { params: { token: string } }) {
  const { token } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    statusType?: 'NOT_FOUND' | 'EXPIRED' | 'BURNED' | 'ERROR';
  } | null>(null);

  // Passcode state
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Loaded data
  const [shareData, setShareData] = useState<ShareData | null>(null);

  // Local search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Security violation states
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [isDevToolsDetected, setIsDevToolsDetected] = useState(false);

  // 1. Initial Link Load
  useEffect(() => {
    async function loadShareLink() {
      setIsLoading(true);
      setErrorInfo(null);
      try {
        const res = await fetch(`/api/share/${token}`, { cache: 'no-store' });
        const data = await res.json();

        if (res.status === 410) {
          setErrorInfo({
            message: data.error || 'This link is no longer available.',
            statusType: data.statusType || 'BURNED',
          });
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          setErrorInfo({
            message: data.error || 'Unable to access shared data.',
            statusType: data.statusType || 'NOT_FOUND',
          });
          setIsLoading(false);
          return;
        }

        if (data.requiresPasscode) {
          setRequiresPasscode(true);
          setIsLoading(false);
          return;
        }

        setShareData(data);
      } catch (err: any) {
        setErrorInfo({
          message: 'Network error or unable to load secure share link.',
          statusType: 'ERROR',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadShareLink();
  }, [token]);

  // 2. Passcode Unlock Submit
  const handleUnlockPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError('Please enter the passcode.');
      return;
    }

    setIsUnlocking(true);
    setPasscodeError('');
    try {
      const res = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();

      if (res.status === 410) {
        setRequiresPasscode(false);
        setErrorInfo({
          message: data.error || 'This link has expired or was already burned.',
          statusType: data.statusType || 'BURNED',
        });
        return;
      }

      if (!res.ok) {
        setPasscodeError(data.error || 'Incorrect passcode. Access denied.');
        return;
      }

      setRequiresPasscode(false);
      setShareData(data);
    } catch {
      setPasscodeError('Error connecting to server. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // 3. Security Handlers: Anti-Inspect, Anti-Copy, Anti-Keybinds, Blur & DevTools Protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+S (Save Page) & Ctrl+P (Print)
      if (e.ctrlKey && ['s', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };

    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleFocusChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    // DevTools resize detection
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setIsDevToolsDetected(true);
      } else {
        setIsDevToolsDetected(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopyCut);
    window.addEventListener('cut', handleCopyCut);
    document.addEventListener('visibilitychange', handleFocusChange);
    window.addEventListener('blur', () => setIsWindowBlurred(true));
    window.addEventListener('focus', () => setIsWindowBlurred(false));
    window.addEventListener('resize', checkDevTools);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopyCut);
      window.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('visibilitychange', handleFocusChange);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  // Filtered records by local search
  const filteredRecords = useMemo(() => {
    if (!shareData?.records) return [];
    if (!searchTerm.trim()) return shareData.records;
    const term = searchTerm.toLowerCase().trim();
    return shareData.records.filter((r) => {
      return (
        r.name?.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.location?.toLowerCase().includes(term) ||
        r.tags?.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [shareData, searchTerm]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white select-none">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center animate-pulse">
            <Lock className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-base">Decrypting Secure Share View...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Verifying token authenticity and access permissions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error / Burned / Expired Screen
  if (errorInfo) {
    const isBurned = errorInfo.statusType === 'BURNED';
    const isExpired = errorInfo.statusType === 'EXPIRED';

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
        {/* Anti-print CSS */}
        <style jsx global>{`
          @media print {
            body {
              display: none !important;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-5 backdrop-blur-xl"
        >
          <div
            className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              isBurned
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                : isExpired
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isBurned ? (
              <Flame className="w-8 h-8 animate-bounce" />
            ) : isExpired ? (
              <Clock className="w-8 h-8" />
            ) : (
              <ShieldAlert className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isBurned
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {isBurned ? 'Link Burned • Self-Destructed' : 'Link Expired'}
            </span>

            <h2 className="text-xl font-black text-white">
              {isBurned
                ? 'This Link Has Been Burned'
                : isExpired
                ? 'This Secure Link Has Expired'
                : 'Access Unavailable'}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              {errorInfo.message}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Protocol Explanation:
            </div>
            <p>
              This snapshot was shared using <strong>One-Time Burn Protection</strong>. To prevent unauthorized redistribution or data harvesting, records are permanently erased from memory after the first viewing session.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Passcode Prompt Screen
  if (requiresPasscode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white">Passcode Protected View</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter the secret PIN or passcode provided by the sender to unlock this data.
            </p>
          </div>

          <form onSubmit={handleUnlockPasscode} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError('');
                }}
                placeholder="Enter secret passcode..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-center font-mono text-base text-white tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isUnlocking ? 'Unlocking Records...' : 'Unlock & View Data'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500">
            🔒 Protected with 256-bit cryptographic verification
          </p>
        </motion.div>
      </div>
    );
  }

  if (!shareData) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none relative overflow-x-hidden font-sans">
      {/* Dynamic diagonal watermark pattern across entire page */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.035] flex flex-wrap items-center justify-center gap-24 p-12 overflow-hidden rotate-[-25deg] select-none"
        aria-hidden="true"
      >
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="text-sm font-black tracking-widest text-white whitespace-nowrap">
            {shareData.sessionWatermark}
          </span>
        ))}
      </div>

      {/* Screen blur overlay if window lost focus or DevTools detected */}
      <AnimatePresence>
        {(isWindowBlurred || isDevToolsDetected) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <EyeOff className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isDevToolsDetected ? 'Developer Tools Detected' : 'Content Hidden (Privacy Guard)'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isDevToolsDetected
                    ? 'Please close your browser developer tools to view this confidential data.'
                    : 'Click back inside this window to resume viewing.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-print and text selection prevention CSS */}
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  {shareData.title}
                </h1>
                {shareData.isOneTime && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500" /> One-Time View
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Shared by: <strong className="text-slate-300">{shareData.createdBy}</strong></span>
                <span>•</span>
                <span>Total: <strong className="text-emerald-400">{shareData.recordCount.toLocaleString()} Contacts</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Leak Shield Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4 z-20">
        {/* Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-brand-950/40 border border-brand-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
            <span className="text-slate-300">
              {shareData.isOneTime
                ? '🔥 This snapshot will permanently self-destruct once you leave or reload this page.'
                : '🔒 You are viewing a confidential snapshot of filtered contacts.'}
            </span>
          </div>

          {/* Local Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in shared records..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Records Table View */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Tags & Segment</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No records match your search inside this shared view.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => {
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Index */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        {/* Contact Name & Email */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {record.avatarUrl ? (
                              <img
                                src={record.avatarUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-brand-900/60 text-brand-300 font-bold flex items-center justify-center text-xs shrink-0">
                                {record.name?.[0] || 'U'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-100 text-xs">
                                {record.name || 'Unnamed Contact'}
                              </div>
                              {record.email && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {record.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{record.phone}</span>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {record.tags && record.tags.length > 0 ? (
                              record.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-semibold"
                                >
                                  {t}
                                </span>
                              ))
                            ) : record.category ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-semibold">
                                {record.category}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[11px]">–</span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4 text-slate-300">
                          {record.location ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{record.location}</span>
                              {record.area && <span className="text-slate-500">({record.area})</span>}
                            </div>
                          ) : (
                            <span className="text-slate-600">–</span>
                          )}
                        </td>

                        {/* Demographics */}
                        <td className="py-3 px-4 text-slate-300">
                          <span>{record.gender || '–'}</span>
                          {record.age ? <span className="text-slate-500 ml-1">({record.age}y)</span> : null}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              record.status === 'Active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {record.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-slate-800/80 text-center text-slate-500 text-xs">
        DataFlow Confidential Sharing Engine • Protected by Single-Use Burn & Watermark Safeguards
      </footer>
    </div>
  );
}
