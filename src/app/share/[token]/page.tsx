'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Search,
  Clock,
  Phone,
  Mail,
  MapPin,
  KeyRound,
  EyeOff,
  Sparkles,
  CameraOff,
  LayoutGrid,
  Table2,
  Copy,
  Check,
  Tag,
  Users,
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

const STATUS_BADGES: Record<string, { bg: string; dot: string }> = {
  Active: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Inactive: {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
  Pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  Suspended: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

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

  // View mode toggle: 'cards' | 'table' (Defaults to cards as requested)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Local search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Copy phone feedback
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Security violation states
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [isDevToolsDetected, setIsDevToolsDetected] = useState(false);
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);

  const copyPhoneToClipboard = (phone: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone);
      }
      setCopiedPhone(phone);
      setTimeout(() => {
        setCopiedPhone(null);
      }, 2000);
    } catch {}
  };

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
            message: data.error || 'Unable to access shared link.',
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
      } catch {
        setErrorInfo({
          message: 'Network error or unable to load shared link.',
          statusType: 'ERROR',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadShareLink();
  }, [token]);

  // 2. Passcode Unlock Submit with 3-Attempt Auto-Lock / Self-Destruct
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
          message:
            data.error ||
            'Maximum failed passcode attempts reached. This link has been permanently burned.',
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

  // 3. Ultra-Hardened Security Stack: Anti-Screenshot, Anti-Inspect, Clipboard Wiper, Privacy Blurs
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const triggerScreenshotLock = () => {
      setIsScreenshotAttempted(true);
      setIsWindowBlurred(true);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('⚠️ CONFIDENTIAL - SCREENSHOT PROHIBITED BY SECURITY POLICY');
        }
      } catch {}
      setTimeout(() => {
        setIsScreenshotAttempted(false);
      }, 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Intercept PrintScreen Key & Screenshot Combinations
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        e.keyCode === 44 ||
        (e.altKey && (e.key === 'PrintScreen' || e.code === 'PrintScreen')) ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault();
        triggerScreenshotLock();
        return false;
      }

      // 2. Block F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // 3. Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // 4. Block Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }

      // 5. Block Ctrl+S (Save Page) & Ctrl+P (Print)
      if (e.ctrlKey && ['s', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        triggerScreenshotLock();
      }
    };

    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      try {
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', '⚠️ CONFIDENTIAL - COPYING DISABLED');
        }
      } catch {}
      return false;
    };

    const handleFocusChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    // Instant screen blackout when mouse leaves window
    const handleMouseLeave = () => {
      setIsWindowBlurred(true);
    };
    const handleMouseEnter = () => {
      setIsWindowBlurred(false);
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
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('copy', handleCopyCut);
    window.addEventListener('cut', handleCopyCut);
    document.addEventListener('visibilitychange', handleFocusChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('blur', () => setIsWindowBlurred(true));
    window.addEventListener('focus', () => setIsWindowBlurred(false));
    window.addEventListener('resize', checkDevTools);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('copy', handleCopyCut);
      window.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('visibilitychange', handleFocusChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
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

  // Loading Screen (White Theme)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800 select-none font-sans">
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xl flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center animate-pulse shadow-inner">
            <Lock className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">Verifying Cryptographic Payload...</h3>
            <p className="text-xs text-gray-500 mt-1">
              Authenticating 256-bit token & access signatures
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error / Burned / Expired Screen (White Theme)
  if (errorInfo) {
    const isBurned = errorInfo.statusType === 'BURNED';
    const isExpired = errorInfo.statusType === 'EXPIRED';

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 select-none font-sans">
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
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-2xl text-center space-y-5"
        >
          <div
            className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-md ${
              isBurned
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : isExpired
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isBurned ? (
              <Flame className="w-8 h-8 animate-bounce text-rose-600" />
            ) : isExpired ? (
              <Clock className="w-8 h-8 text-amber-600" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-gray-600" />
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isBurned
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isBurned ? 'Payload Burned • Self-Destructed' : 'Token Expired'}
            </span>

            <h2 className="text-xl font-extrabold text-gray-900">
              {isBurned
                ? 'This Link Has Been Burned'
                : isExpired
                ? 'This Secure Link Has Expired'
                : 'Access Unavailable'}
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              {errorInfo.message}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 text-left space-y-1">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Security Protocol Explanation:
            </div>
            <p>
              This snapshot was shared using <strong>One-Time Burn Protection & 3-Strike Auto-Lock</strong>. To prevent unauthorized redistribution or data harvesting, records are permanently erased from memory after the viewing session ends or invalid passcode threshold is reached.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Passcode Prompt Screen (White Theme)
  if (requiresPasscode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 select-none font-sans">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-2xl text-center space-y-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Passcode Protected View</h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter the secret PIN or passcode provided by the sender to unlock this data.
            </p>
          </div>

          {/* Anti-Brute-Force Warning Banner */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center justify-center gap-1.5 shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Anti-Brute Force: 3 wrong attempts will permanently burn this link.</span>
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-center font-mono text-base text-gray-900 tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isUnlocking ? 'Unlocking Records...' : 'Unlock & View Data'}
            </button>
          </form>

          <p className="text-[10px] text-gray-400 font-medium">
            🔒 Protected with 256-bit cryptographic verification
          </p>
        </motion.div>
      </div>
    );
  }

  if (!shareData) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col select-none relative overflow-x-hidden font-sans">
      {/* Dynamic High-Density Diagonal Watermark Pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-20 opacity-[0.09] flex flex-wrap items-center justify-center gap-16 p-6 overflow-hidden rotate-[-22deg] select-none text-slate-950 font-black"
        aria-hidden="true"
      >
        {Array.from({ length: 96 }).map((_, i) => (
          <span key={i} className="text-xs sm:text-sm font-black tracking-widest whitespace-nowrap drop-shadow-xs">
            {shareData.sessionWatermark}
          </span>
        ))}
      </div>

      {/* Screen blur overlay if window lost focus, screenshot attempted, or DevTools detected */}
      <AnimatePresence>
        {(isWindowBlurred || isDevToolsDetected || isScreenshotAttempted) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="p-7 rounded-3xl bg-white border border-gray-200 shadow-2xl max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-inner">
                {isScreenshotAttempted ? (
                  <CameraOff className="w-8 h-8 animate-pulse text-rose-600" />
                ) : (
                  <EyeOff className="w-8 h-8 text-amber-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {isScreenshotAttempted
                    ? 'Screenshot Attempt Blocked!'
                    : isDevToolsDetected
                    ? 'Developer Tools Detected'
                    : 'Confidential Data Hidden (Privacy Guard)'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {isScreenshotAttempted
                    ? 'Screen capturing is strictly prohibited on this secure gateway. Clipboard has been cleared.'
                    : isDevToolsDetected
                    ? 'Please close your browser developer tools to view this confidential data.'
                    : 'Click back inside this browser window to resume viewing.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-print and Zero-Latency CSS Anti-Screenshot Shroud */}
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
          -webkit-touch-callout: none !important;
        }
        /* Instant CSS Blur when window is inactive or cursor leaves */
        body:not(:focus-within) .confidential-view-wrapper {
          filter: blur(25px) !important;
          opacity: 0.15 !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* Top Header Bar (White Theme) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                  {shareData.title}
                </h1>
                {shareData.isOneTime && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3 text-rose-600" /> One-Time View
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                <span>Shared by: <strong className="text-gray-700 font-semibold">{shareData.createdBy}</strong></span>
                <span>•</span>
                <span>Total: <strong className="text-emerald-700 font-bold">{shareData.recordCount.toLocaleString()} Contacts</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anti-Screenshot & Anti-Leak Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4 z-10">
        {/* Notice & Control Toolbar (View Toggle + Search) */}
        <div className="p-3.5 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-xs font-semibold text-gray-800">
              {shareData.isOneTime
                ? '🔥 Snapshot will self-destruct once page is closed/reloaded.'
                : `Showing ${filteredRecords.length} of ${shareData.recordCount} contacts`}
            </span>
          </div>

          {/* Right Action Bar: Toggle Switch + Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cards vs Table View Toggle Pill (Matching User Design) */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {/* Local Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Confidential View Wrapper (Protected Container with Auto-Blur) */}
        <div className="confidential-view-wrapper transition-all duration-150">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 text-xs font-medium">
                No contacts match your search query inside this shared view.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            /* 2-Column Responsive Secure Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map((record, index) => {
                const badge = STATUS_BADGES[record.status || 'Active'] || STATUS_BADGES.Active;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: (index % 10) * 0.02 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Index & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-mono text-[10px] font-bold">
                          #{index + 1}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {record.status || 'Active'}
                        </span>
                      </div>

                      {/* Contact Profile Row */}
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        {record.avatarUrl ? (
                          <img
                            src={record.avatarUrl}
                            alt=""
                            className="w-11 h-11 rounded-2xl object-cover border border-gray-200 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-brand-600/20">
                            {record.name ? record.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                        )}

                        {/* Name & Email */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-brand-600 transition-colors">
                            {record.name || 'Unnamed Contact'}
                          </h4>
                          {record.email ? (
                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              {record.email}
                            </p>
                          ) : (
                            <p className="text-[11px] text-gray-400 mt-0.5">Verified Contact</p>
                          )}
                        </div>
                      </div>

                      {/* Phone Box with Direct Call & Copy Action */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                        <a
                          href={`tel:${record.phone}`}
                          className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span>{record.phone}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyPhoneToClipboard(record.phone)}
                          title="Copy Phone Number"
                          className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-brand-600 hover:border-brand-300 transition-all shadow-2xs text-[11px] flex items-center gap-1 font-medium active:scale-95"
                        >
                          {copiedPhone === record.phone ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold text-[10px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-gray-600 text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Tags / Segments */}
                      {((record.tags && record.tags.length > 0) || record.category) && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {record.tags && record.tags.length > 0 ? (
                            record.tags.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold"
                              >
                                <Tag className="w-2.5 h-2.5 text-purple-500" />
                                {t}
                              </span>
                            ))
                          ) : record.category ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              <Tag className="w-2.5 h-2.5 text-purple-500" />
                              {record.category}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Location & Demographics */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {record.location || record.area || 'Location N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-gray-700 shrink-0">
                        <span>{record.gender || '–'}</span>
                        {record.age ? <span className="text-gray-400">({record.age}y)</span> : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/90 text-gray-600 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Tags & Segment</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Demographics</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRecords.map((record, index) => {
                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Index */}
                          <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                            {index + 1}
                          </td>

                          {/* Contact Name & Email */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {record.avatarUrl ? (
                                <img
                                  src={record.avatarUrl}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0 shadow-xs"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0 border border-brand-200">
                                  {record.name?.[0] || 'U'}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900 text-xs">
                                  {record.name || 'Unnamed Contact'}
                                </div>
                                {record.email && (
                                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-gray-400" /> {record.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
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
                                    className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold"
                                  >
                                    {t}
                                  </span>
                                ))
                              ) : record.category ? (
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                                  {record.category}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-[11px]">–</span>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4 text-gray-700">
                            {record.location ? (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span>{record.location}</span>
                                {record.area && <span className="text-gray-400">({record.area})</span>}
                              </div>
                            ) : (
                              <span className="text-gray-300">–</span>
                            )}
                          </td>

                          {/* Demographics */}
                          <td className="py-3 px-4 text-gray-700">
                            <span>{record.gender || '–'}</span>
                            {record.age ? <span className="text-gray-400 ml-1">({record.age}y)</span> : null}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                record.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {record.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-gray-200 text-center text-gray-500 text-xs bg-white/80">
        Encrypted Vault Gateway • Protected by Single-Use Burn & 256-Bit Cryptographic Safeguards
      </footer>
    </div>
  );
}
