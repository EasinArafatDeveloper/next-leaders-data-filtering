'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Link as LinkIcon,
  Copy,
  Check,
  Flame,
  Clock,
  KeyRound,
  ShieldCheck,
  EyeOff,
  Sparkles,
  ExternalLink,
  Users,
  Globe,
  Shuffle,
} from 'lucide-react';
import { FilterQueryState } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterQueryState;
  totalFilteredCount: number;
}

const DOMAIN_OPTIONS = [
  { id: 'auto', label: '🎲 Auto-Rotate / Random (Smart Cycling)', badge: 'Recommended' },
  { id: 'https://tempshr.click', label: 'tempshr.click', badge: 'Fast CDN' },
  { id: 'https://tempshr.xyz', label: 'tempshr.xyz', badge: 'Stealth' },
  { id: 'https://tempshr.lol', label: 'tempshr.lol', badge: 'Secure' },
];

export function ShareLinkModal({
  isOpen,
  onClose,
  filters,
  totalFilteredCount,
}: ShareLinkModalProps) {
  const { theme, colorTheme } = useTheme();
  const [title, setTitle] = useState('');
  const [targetDomain, setTargetDomain] = useState<string>('auto');
  const [isOneTime, setIsOneTime] = useState(true);
  const [maxViews, setMaxViews] = useState(1);
  const [expiryHours, setExpiryHours] = useState(24);
  const [enablePasscode, setEnablePasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    shareUrl: string;
    token: string;
    domainUsed?: string;
    expiresAt: string;
    isOneTime: boolean;
    hasPasscode: boolean;
    recordCount: number;
    theme?: string;
    themeMode?: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          targetDomain: targetDomain === 'auto' ? undefined : targetDomain,
          filters,
          isOneTime,
          maxViews: isOneTime ? 1 : maxViews,
          expiryHours,
          passcode: enablePasscode && passcode.trim() ? passcode.trim() : undefined,
          theme: colorTheme,
          themeMode: theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate secure share link');
      }

      setGeneratedLink(data);
      toast.success('Share link generated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error generating link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.shareUrl);
    setIsCopied(true);
    toast.success('Secure link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const resetForm = () => {
    setGeneratedLink(null);
    setTitle('');
    setTargetDomain('auto');
    setIsOneTime(true);
    setMaxViews(1);
    setExpiryHours(24);
    setEnablePasscode(false);
    setPasscode('');
    setIsCopied(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                    Share Contacts Snapshot
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    Share {totalFilteredCount.toLocaleString()} filtered contacts securely
                  </p>
                </div>
              </div>

              <button
                onClick={handleModalClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {!generatedLink ? (
                <>
                  {/* Summary Box */}
                  <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          Active Selection:
                        </span>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                          {totalFilteredCount.toLocaleString()} matching contacts snapshot
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] uppercase">
                      Snapshot
                    </span>
                  </div>

                  {/* Title / Label */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                      <span>Snapshot Title (Optional)</span>
                      <span className="text-[10px] text-gray-400">For your audit logs</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. VIP Leads Snapshot, Marketing Cohort..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Multi-Domain Dynamic Rotation Selector */}
                  <div className="space-y-2">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-600" /> Share Domain Selection:
                      </span>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                        Multi-Domain Shield
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {DOMAIN_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTargetDomain(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            targetDomain === opt.id
                              ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-400 dark:border-brand-600 ring-2 ring-brand-500/20 shadow-xs'
                              : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                              {opt.label}
                            </span>
                            {targetDomain === opt.id && (
                              <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-1" />
                            )}
                          </div>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 block">
                            {opt.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Burn After Read Options */}
                  <div className="space-y-2">
                    <label className="font-bold text-gray-800 dark:text-gray-200">
                      Security & Self-Destruction Protocol:
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOneTime(true);
                          setMaxViews(1);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isOneTime
                            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
                            : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1">
                            🔥 1-Time View
                          </span>
                          {isOneTime && <Check className="w-3.5 h-3.5 text-rose-600" />}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Self-destructs immediately after recipient opens it once.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsOneTime(false);
                          setMaxViews(3);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          !isOneTime
                            ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 ring-2 ring-brand-500/20'
                            : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-brand-600 dark:text-brand-400 text-xs">
                            Multi-View Limit
                          </span>
                          {!isOneTime && <Check className="w-3.5 h-3.5 text-brand-600" />}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Set a custom maximum view count before burning.
                        </p>
                      </button>
                    </div>

                    {!isOneTime && (
                      <div className="pt-2 flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                          Maximum Views:
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={maxViews}
                          onChange={(e) => setMaxViews(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-20 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Auto Expiry Duration */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Auto-Expiration Time
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '1 Hour', hours: 1 },
                        { label: '24 Hours', hours: 24 },
                        { label: '3 Days', hours: 72 },
                        { label: '7 Days', hours: 168 },
                      ].map((opt) => (
                        <button
                          key={opt.hours}
                          type="button"
                          onClick={() => setExpiryHours(opt.hours)}
                          className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] border transition-all ${
                            expiryHours === opt.hours
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Passcode Protection */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enablePasscode}
                        onChange={(e) => setEnablePasscode(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                      />
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-brand-600" /> Protect with Secret Passcode
                      </span>
                    </label>

                    {enablePasscode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5 pt-1"
                      >
                        <input
                          type="text"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="Enter 4–8 character passcode / PIN..."
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          * The recipient will be required to type this passcode before viewing any contact records.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Active Safeguards Banner */}
                  <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                      <ShieldCheck className="w-4 h-4" /> Privacy & Security:
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-emerald-700 dark:text-emerald-400">
                      <div>✓ Encrypted Share Token</div>
                      <div>✓ Auto-Expiration Timer</div>
                      <div>✓ Optional View Limit & Passcode</div>
                      <div>✓ Direct View Access</div>
                    </div>
                  </div>
                </>
              ) : (
                /* Generated Link Success Box */
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-center space-y-1.5 pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                      Share Link Ready!
                    </h4>
                    <p className="text-xs text-gray-500">
                      {generatedLink.isOneTime
                        ? '🔥 Single-Use: This link will expire after the first view.'
                        : `Expires in ${expiryHours} hours.`}
                    </p>
                  </div>

                  {/* Link Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-inner space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono flex items-center gap-1 text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-brand-400" /> Domain:{' '}
                        <strong className="text-brand-300">{generatedLink.domainUsed || 'tempshr'}</strong>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold">
                        {generatedLink.recordCount} Records
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all leading-relaxed">
                      {generatedLink.shareUrl}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Share Link'}</span>
                      </button>

                      <a
                        href={generatedLink.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="Open in new tab (Note: Will burn if 1-time view is active!)"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-900/80 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {!generatedLink ? (
                <>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || totalFilteredCount === 0}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <span>Generating Link...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Generate Share Link</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-full py-2.5 rounded-xl bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                >
                  Done / Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
