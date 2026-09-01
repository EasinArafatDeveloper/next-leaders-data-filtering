'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IRecord } from '@/types';
import {
  X,
  User,
  MapPin,
  Activity,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Copy,
  Check,
  Sparkles,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface RecordDetailDrawerProps {
  record: IRecord | null;
  onClose: () => void;
}

export function RecordDetailDrawer({ record, onClose }: RecordDetailDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock body scroll when drawer is open
    if (record) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [record]);

  if (!mounted || !record) return null;

  const avatarUrl = record.avatarUrl || (record.avatarType?.startsWith('http') ? record.avatarType : '');
  const initials = record.name
    ? record.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const handleCopyPhone = () => {
    if (record.phone) {
      navigator.clipboard.writeText(record.phone);
      setCopied(true);
      toast.success(`Copied ${record.phone} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Dark Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-all"
      />

      {/* Slide-over Full Height Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative z-10 w-full sm:w-[480px] bg-white dark:bg-slate-900 h-full border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Drawer Header with Clean Close Action */}
        <div className="pt-5 pb-4 px-6 border-b border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3.5 min-w-0">
            {avatarUrl && !imgError ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 ring-2 ring-brand-500/25 bg-gray-100 dark:bg-slate-800 shadow-md">
                <img
                  src={avatarUrl}
                  alt={record.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-base flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {record.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {record.status} Member
                </span>
                {record.gender && (
                  <span className="text-[11px] text-gray-400 font-medium">
                    &bull; {record.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Full Profile Photo Preview Box if available */}
          {avatarUrl && !imgError && (
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-600" /> Profile Picture
                </span>
                <a
                  href={avatarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Open High-Res <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 flex items-center justify-center border border-gray-200/60 dark:border-slate-700/60 shadow-inner">
                <img
                  src={avatarUrl}
                  alt={record.name}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* 2. Personal Information Card */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" /> Personal Information
            </h4>
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 space-y-3 text-xs">
              {/* Phone */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phone / Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {record.phone}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title="Copy phone"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email Address</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  {record.email ? (
                    <>
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {record.email}
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </span>
              </div>

              {/* Age & Gender */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Age & Gender</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {record.age > 0 ? `${record.age} years` : 'N/A'} &bull; {record.gender}
                </span>
              </div>

              {/* Avatar Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avatar Photo</span>
                <span className={`font-semibold flex items-center gap-1.5 ${
                  avatarUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${avatarUrl ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {avatarUrl ? 'Photo Available' : 'No Photo'}
                </span>
              </div>

              {/* Location */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Location / City</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {record.location || record.area || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Activity & Online Details Card */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-600" /> Activity & Online Metrics
            </h4>
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {record.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Active Days (≤)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {record.activeDays > 0 ? `${record.activeDays} days` : '0 days'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Last Online Time</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {record.lastActive ? new Date(record.lastActive).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Attached Tags & Audience Segments */}
          {((record.tags && record.tags.length > 0) || record.category) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" /> Attached Tags & Audience Notes
              </h4>
              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 flex flex-wrap gap-2">
                {record.tags && record.tags.length > 0 ? (
                  record.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/80 dark:border-brand-900/60 shadow-sm"
                    >
                      <Tag className="w-3 h-3 text-brand-500" />
                      {tag}
                    </span>
                  ))
                ) : record.category ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/80 dark:border-brand-900/60 shadow-sm">
                    <Tag className="w-3 h-3 text-brand-500" />
                    {record.category}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* 5. Additional Attributes / Metadata */}
          {record.customFields && Object.keys(record.customFields).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Raw File Attributes
              </h4>
              <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 space-y-2 text-xs">
                {Object.entries(record.customFields).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-3">
                    <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-right truncate max-w-[220px]">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyPhone}
            className="w-1/2 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Number</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all active:scale-[0.98]"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
