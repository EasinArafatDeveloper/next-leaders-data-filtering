'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface DropZoneProps {
  onFileParsed: (filename: string, rows: any[], fileSize: string) => void;
  isProcessing?: boolean;
}

export function DropZone({ onFileParsed, isProcessing }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    rows: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processFile = (file: File) => {
    setError(null);
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setError('Unsupported file type. Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    const fileSizeStr = formatFileSize(file.size);

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setSelectedFile({ name: fileName, size: fileSizeStr, rows: results.data });
          } else {
            setError('The selected CSV file appears to be empty.');
          }
        },
        error: (err) => {
          setError(`CSV parsing error: ${err.message}`);
        },
      });
    } else {
      // XLSX / XLS processing
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet);

          if (jsonRows && jsonRows.length > 0) {
            setSelectedFile({ name: fileName, size: fileSizeStr, rows: jsonRows });
          } else {
            setError('The selected Excel file contains no data rows.');
          }
        } catch (err: any) {
          setError(`Excel parsing error: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadTrigger = () => {
    if (selectedFile) {
      onFileParsed(selectedFile.name, selectedFile.rows, selectedFile.size);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[1.01]'
            : 'border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-400 dark:hover:border-slate-700 shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Upload your dataset
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
          Drag & drop your CSV or Excel file here, or{' '}
          <span className="text-brand-600 dark:text-brand-400 font-semibold underline">
            browse files
          </span>
        </p>
        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          Supported: CSV, XLSX, XLS (up to 50MB)
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected File Card & Actions */}
      {selectedFile && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-900">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedFile.rows.length.toLocaleString()} rows detected &bull; {selectedFile.size}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Parsed Ready
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleUploadTrigger}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Dataset...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload & Process Dataset
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
