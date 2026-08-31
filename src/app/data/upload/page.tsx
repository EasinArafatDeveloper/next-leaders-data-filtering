'use client';

import React, { useState } from 'react';
import { DropZone } from '@/components/upload/DropZone';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { UploadSummaryModal } from '@/components/upload/UploadSummaryModal';
import { toast } from 'sonner';
import { FileText, AlertCircle, RefreshCw } from 'lucide-react';

type UploadStage = 'idle' | 'uploading' | 'done' | 'error';

export default function UploadDataPage() {
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState<{
    newCount: number;
    updatedCount: number;
    totalCount: number;
    skippedCount: number;
    filename: string;
  } | null>(null);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleFileParsed = async (filename: string, rows: any[], fileSize: string) => {
    setUploadStage('uploading');
    setErrorMessage('');
    setCurrentStep(1); // Stage 1: Uploading
    await sleep(300);
    setCurrentStep(2); // Stage 2: Validating
    await sleep(400);
    setCurrentStep(3); // Stage 3: Normalizing & Matching

    try {
      const res = await fetch('/api/data/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, rows, fileSize }),
      });

      await sleep(300);
      setCurrentStep(4); // Stage 4: Merging & Updating MongoDB

      const data = await res.json();

      await sleep(400);
      setCurrentStep(5); // Stage 5: Complete

      if (res.ok) {
        await sleep(200);
        setUploadResult({
          newCount: data.newCount || 0,
          updatedCount: data.updatedCount || 0,
          totalCount: data.totalCount || 0,
          skippedCount: data.skippedCount || 0,
          filename,
        });
        setUploadStage('done');
        const summaryMsg = data.updatedCount > 0
          ? `Added ${data.newCount} new, merged ${data.updatedCount} existing records!`
          : `Successfully added ${data.newCount} records!`;
        toast.success(summaryMsg);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadStage('error');
      setErrorMessage(err.message || 'Failed to process file');
      toast.error(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleReset = () => {
    setUploadStage('idle');
    setCurrentStep(0);
    setUploadResult(null);
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Upload Area — only visible when idle */}
      {uploadStage === 'idle' && (
        <>
          <DropZone
            onFileParsed={handleFileParsed}
            isProcessing={false}
          />

          {/* Smart Merge Feature Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50/80 to-indigo-50/60 dark:from-brand-950/40 dark:to-indigo-950/30 border border-brand-200/80 dark:border-brand-900/60 shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-gray-900 dark:text-white">
                ⚡ Smart Deduplication & Incremental Field Merging
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                When you upload a new file, the system checks existing records by phone/email. If a record already exists, it <strong>fills in any missing fields</strong> (e.g. missing email, avatar, nickname, location) without deleting or duplicating existing data. Brand new records are inserted seamlessly.
              </p>
            </div>
          </div>

          {/* File Format Tips */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-600" /> Supported Column Headers & Formats
            </h4>
            <p className="text-xs text-gray-500">
              Your CSV or Excel file can have any column structure. The system automatically detects:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">👤 Name / Nickname</span>
                <span className="text-gray-500 text-[11px]">name, nickname, full name</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">📞 Phone / Number</span>
                <span className="text-gray-500 text-[11px]">phone, mobile, number, contact</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">✉️ Email Address</span>
                <span className="text-gray-500 text-[11px]">email, mail (fills missing email)</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">🖼️ Avatar Photo</span>
                <span className="text-gray-500 text-[11px]">avatar, photo, image URL</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">🎂 Age & Gender</span>
                <span className="text-gray-500 text-[11px]">age, gender, sex</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">📍 Location & Activity</span>
                <span className="text-gray-500 text-[11px]">location, last online, active days</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Progress Indicator */}
      {uploadStage === 'uploading' && <UploadProgress currentStage={currentStep} />}

      {/* Error State */}
      {uploadStage === 'error' && (
        <div className="text-center py-16 space-y-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 shadow-card">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Upload Error</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
              {errorMessage || 'Something went wrong processing your file.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* Upload Success Summary Modal with Smart Merge Breakdown */}
      {uploadStage === 'done' && uploadResult && (
        <UploadSummaryModal
          newCount={uploadResult.newCount}
          updatedCount={uploadResult.updatedCount}
          totalCount={uploadResult.totalCount}
          skippedCount={uploadResult.skippedCount}
          filename={uploadResult.filename}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
