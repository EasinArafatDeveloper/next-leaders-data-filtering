'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  Tag,
  Sparkles,
  Filter,
  Check,
  ListFilter,
  Layers,
  Phone,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ColumnMappingStudio, getAutoSuggestedField } from './ColumnMappingStudio';

interface DropZoneProps {
  onFileParsed: (
    filename: string,
    rows: any[],
    fileSize: string,
    tags?: string[],
    columnMapping?: Record<string, string>
  ) => void;
  isProcessing?: boolean;
}

const DEFAULT_PRESET_TAGS = [
  { label: '📱 iPhone User', value: 'iPhone User' },
  { label: '💬 WhatsApp Active', value: 'WhatsApp Active' },
  { label: '🟣 Viber Contact', value: 'Viber Contact' },
  { label: '⭐ VIP Client', value: 'VIP Client' },
  { label: '🏢 Corporate Lead', value: 'Corporate Lead' },
  { label: '🔥 Hot Leads', value: 'Hot Leads' },
  { label: '📍 Dhaka Zone', value: 'Dhaka Zone' },
  { label: '💼 Business Account', value: 'Business Account' },
];

interface StatusOption {
  value: string;
  displayLabel: string;
  count: number;
  variant: 'all' | 'positive' | 'negative' | 'neutral';
}

interface FileAnalysis {
  fileType: 'single_column_phone' | 'phone_with_status' | 'multi_column_dataset';
  totalColumns: number;
  columnNames: string[];
  phoneColumnName?: string;
  statusColumnName?: string;
  statusOptions: StatusOption[];
  totalRows: number;
}

function analyzeDatasetFile(rows: any[]): FileAnalysis {
  if (!rows || rows.length === 0) {
    return {
      fileType: 'single_column_phone',
      totalColumns: 0,
      columnNames: [],
      statusOptions: [],
      totalRows: 0,
    };
  }

  const sampleRow = rows[0] || {};
  const rawKeys = Object.keys(sampleRow).filter((k) => k && k.trim().length > 0);
  const totalRows = rows.length;

  if (rawKeys.length <= 1) {
    return {
      fileType: 'single_column_phone',
      totalColumns: Math.max(1, rawKeys.length),
      columnNames: rawKeys,
      phoneColumnName: rawKeys[0] || 'Phone',
      statusOptions: [],
      totalRows,
    };
  }

  // 1. Identify phone column
  let phoneKey = '';
  for (const key of rawKeys) {
    const lk = key.toLowerCase().replace(/[\s_\.-]/g, '');
    if (['phone', 'mobile', 'number', 'cell', 'msisdn', 'contact', 'tel'].includes(lk)) {
      phoneKey = key;
      break;
    }
  }

  if (!phoneKey) {
    for (const key of rawKeys) {
      let numericCount = 0;
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const val = String(rows[i]?.[key] || '').replace(/[\s\+\-\(\)]/g, '');
        if (val.length >= 7 && /^\d+$/.test(val)) numericCount++;
      }
      if (numericCount >= Math.min(rows.length, 10) * 0.7) {
        phoneKey = key;
        break;
      }
    }
  }

  // 2. Identify status / Yes-No / Decision column
  let candidateStatusKey = '';
  const otherKeys = rawKeys.filter((k) => k !== phoneKey);

  for (const key of otherKeys) {
    const lk = key.toLowerCase().replace(/[\s_\.-]/g, '');
    const isNamedStatus = [
      'status',
      'valid',
      'verified',
      'viber',
      'whatsapp',
      'active',
      'hasavatar',
      'avatar',
      'decision',
      'result',
      'isvalid',
      'check',
      'yesno',
      'yn',
      'state',
      'presence',
      'tag',
      'label',
    ].includes(lk);

    const valCounts = new Map<string, number>();
    for (const r of rows) {
      const v = String(r[key] === null || r[key] === undefined ? '' : r[key]).trim();
      if (v) valCounts.set(v, (valCounts.get(v) || 0) + 1);
    }

    const uniqueCount = valCounts.size;
    const isBinaryValues = Array.from(valCounts.keys()).some((v) =>
      ['yes', 'no', 'true', 'false', 'y', 'n', '1', '0', 'active', 'inactive', 'valid', 'invalid', 'available'].includes(
        v.toLowerCase()
      )
    );

    if (isNamedStatus || (rawKeys.length === 2 && uniqueCount >= 1 && uniqueCount <= 8) || (isBinaryValues && uniqueCount <= 8)) {
      candidateStatusKey = key;
      break;
    }
  }

  if (candidateStatusKey) {
    const valCounts = new Map<string, number>();
    for (const r of rows) {
      const v = String(r[candidateStatusKey] === null || r[candidateStatusKey] === undefined ? '' : r[candidateStatusKey]).trim();
      if (v) {
        const keyMatch = Array.from(valCounts.keys()).find((k) => k.toLowerCase() === v.toLowerCase()) || v;
        valCounts.set(keyMatch, (valCounts.get(keyMatch) || 0) + 1);
      }
    }

    const options: StatusOption[] = [
      {
        value: 'ALL',
        displayLabel: 'All Records',
        count: totalRows,
        variant: 'all',
      },
    ];

    valCounts.forEach((count, val) => {
      const lower = val.toLowerCase();
      let variant: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (['yes', 'true', '1', 'active', 'valid', 'y', 'available', 'success'].includes(lower)) {
        variant = 'positive';
      } else if (['no', 'false', '0', 'inactive', 'invalid', 'n', 'unavailable', 'failed'].includes(lower)) {
        variant = 'negative';
      }

      options.push({
        value: val,
        displayLabel: val,
        count,
        variant,
      });
    });

    return {
      fileType: rawKeys.length === 2 ? 'phone_with_status' : 'multi_column_dataset',
      totalColumns: rawKeys.length,
      columnNames: rawKeys,
      phoneColumnName: phoneKey,
      statusColumnName: candidateStatusKey,
      statusOptions: options,
      totalRows,
    };
  }

  return {
    fileType: rawKeys.length <= 1 ? 'single_column_phone' : 'multi_column_dataset',
    totalColumns: rawKeys.length,
    columnNames: rawKeys,
    phoneColumnName: phoneKey,
    statusOptions: [],
    totalRows,
  };
}

export function DropZone({ onFileParsed, isProcessing }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    rows: any[];
    analysis: FileAnalysis;
  } | null>(null);

  // Selected Scope Filter Option (e.g. 'ALL', 'Yes', 'No')
  const [selectedFilterOption, setSelectedFilterOption] = useState<string>('ALL');

  // Multiple Tag Management State
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Custom Column Mapping State
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isMappingStudioOpen, setIsMappingStudioOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;

    const rawInputs = newTagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated = [...selectedTags];
    rawInputs.forEach((tag) => {
      if (!updated.includes(tag)) {
        updated.push(tag);
      }
    });

    setSelectedTags(updated);
    setNewTagInput('');
    if (tagInputRef.current) {
      tagInputRef.current.focus();
    }
  };

  const handleTogglePresetTag = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagValue));
    } else {
      setSelectedTags([...selectedTags, tagValue]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const applyFileResult = (fileName: string, fileSizeStr: string, rows: any[]) => {
    const analysis = analyzeDatasetFile(rows);
    setSelectedFile({
      name: fileName,
      size: fileSizeStr,
      rows,
      analysis,
    });
    setSelectedFilterOption('ALL');

    // Auto-detect initial column mappings
    const initialMapping: Record<string, string> = {};
    analysis.columnNames.forEach((col) => {
      const samples = rows
        .map((r) => r[col])
        .filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
      initialMapping[col] = getAutoSuggestedField(col, samples);
    });
    setColumnMapping(initialMapping);
    setIsMappingStudioOpen(analysis.columnNames.length > 2);

    // Smart tag suggestions
    const lowerName = fileName.toLowerCase();
    const initialTags: string[] = [];
    if (lowerName.includes('iphone')) initialTags.push('iPhone User');
    if (lowerName.includes('whatsapp') || lowerName.includes('wa')) initialTags.push('WhatsApp Active');
    if (lowerName.includes('viber')) initialTags.push('Viber Contact');
    if (lowerName.includes('vip')) initialTags.push('VIP Client');
    setSelectedTags(initialTags);
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
            applyFileResult(fileName, fileSizeStr, results.data);
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
            applyFileResult(fileName, fileSizeStr, jsonRows);
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

  // Compute records to upload based on chosen filter option
  const getRecordsToUpload = () => {
    if (!selectedFile) return [];
    if (
      selectedFilterOption === 'ALL' ||
      !selectedFile.analysis.statusColumnName
    ) {
      return selectedFile.rows;
    }

    const col = selectedFile.analysis.statusColumnName;
    return selectedFile.rows.filter((r) => {
      const val = String(r[col] === null || r[col] === undefined ? '' : r[col]).trim();
      return val.toLowerCase() === selectedFilterOption.toLowerCase();
    });
  };

  const finalRowsToUpload = getRecordsToUpload();

  const handleUploadTrigger = () => {
    if (selectedFile) {
      const rowsToSubmit = finalRowsToUpload;
      if (rowsToSubmit.length === 0) {
        setError('No rows match the selected filter criteria.');
        return;
      }
      onFileParsed(
        selectedFile.name,
        rowsToSubmit,
        selectedFile.size,
        selectedTags,
        columnMapping
      );
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

        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
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
          Supported: CSV, XLSX, XLS (Single-column or Multi-column, up to 50MB)
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected File Card & Analysis */}
      {selectedFile && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 shadow-card space-y-5 animate-in fade-in">
          {/* File Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-900 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center flex-wrap gap-2">
                  <span>{selectedFile.rows.length.toLocaleString()} total rows</span>
                  <span>&bull;</span>
                  <span>{selectedFile.size}</span>
                  <span>&bull;</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {selectedFile.analysis.totalColumns} {selectedFile.analysis.totalColumns === 1 ? 'Column' : 'Columns'}
                  </span>
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 self-start sm:self-center">
              <CheckCircle2 className="w-4 h-4" /> Parsed & Ready
            </span>
          </div>

          {/* 1. SMART FILE STRUCTURE DETECTION BANNER */}
          {selectedFile.analysis.fileType === 'single_column_phone' && (
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <h5 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  Pure Phone Number List Detected
                  <span className="px-2 py-0.5 rounded-full bg-blue-200/70 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-semibold text-[10px]">
                    1 Column File
                  </span>
                </h5>
                <p className="text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                  All rows in this file contain phone numbers. They will be imported directly and merged into your active database.
                </p>
              </div>
            </div>
          )}

          {/* 2. SMART SCOPE / YES-NO FILTER SELECTOR (Appears when 2-column or status column is detected) */}
          {selectedFile.analysis.statusColumnName && selectedFile.analysis.statusOptions.length > 1 && (
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <h5 className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                    <ListFilter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Column Filter Detected: <span className="underline decoration-amber-400">&ldquo;{selectedFile.analysis.statusColumnName}&rdquo;</span>
                  </h5>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    This file has a decision/status column. Choose which records you want to import:
                  </p>
                </div>

                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 self-start sm:self-center">
                  Importing: {finalRowsToUpload.length.toLocaleString()} of {selectedFile.rows.length.toLocaleString()} rows
                </span>
              </div>

              {/* Filter Selector Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedFile.analysis.statusOptions.map((opt) => {
                  const isSelected = selectedFilterOption.toLowerCase() === opt.value.toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedFilterOption(opt.value)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? opt.variant === 'positive'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/20'
                            : opt.variant === 'negative'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 ring-2 ring-rose-500/20'
                            : 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20 ring-2 ring-brand-500/20'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span>
                        {opt.value === 'ALL'
                          ? '⚡ All Records'
                          : opt.variant === 'positive'
                          ? `🟢 Only '${opt.displayLabel}'`
                          : opt.variant === 'negative'
                          ? `🔴 Only '${opt.displayLabel}'`
                          : `🏷️ ${opt.displayLabel}`}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {opt.count.toLocaleString()}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CUSTOM COLUMN MAPPING STUDIO */}
          {selectedFile.analysis.columnNames.length > 0 && (
            <ColumnMappingStudio
              columnNames={selectedFile.analysis.columnNames}
              sampleRows={selectedFile.rows}
              mapping={columnMapping}
              onMappingChange={setColumnMapping}
              isOpen={isMappingStudioOpen}
              onToggleOpen={() => setIsMappingStudioOpen(!isMappingStudioOpen)}
            />
          )}

          {/* 4. MULTI-TAG & BATCH LABEL MANAGER */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50/60 to-accent-50/40 dark:from-brand-950/30 dark:to-accent-950/20 border border-brand-200/80 dark:border-brand-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  Assign Batch Tags & Labels (Multi-Tag Selector)
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Attach labels to these records. Select presets or type custom tags with the <strong className="text-brand-600 dark:text-brand-400">+</strong> button.
                </p>
              </div>

              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-[11px] text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium self-start sm:self-center transition-colors"
                >
                  Clear all tags
                </button>
              )}
            </div>

            {/* Currently Active Selected Tags Pills */}
            {selectedTags.length > 0 && (
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-brand-200/60 dark:border-brand-900/40 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                  Active Selected Tags ({selectedTags.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-sm shadow-brand-600/20 animate-in fade-in zoom-in-95"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 hover:bg-white/20 rounded-md transition-colors"
                        title={`Remove ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Preset Tags (Click to toggle) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-500" /> Quick Presets (Click to select/unselect):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_PRESET_TAGS.map((preset) => {
                  const isSelected = selectedTags.includes(preset.value);
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleTogglePresetTag(preset.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/25 ring-2 ring-brand-500/20'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* + Add Custom Tag Input Form */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Type a custom tag name (e.g. 'Campaign Nov 2026', 'Banani Branch') and press Enter..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-900/80 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  disabled={!newTagInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                  title="Add Tag"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tag</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 pl-1">
                Tip: You can add multiple custom tags by separating with commas (e.g. <em>Q4 Campaign, Hot VIP</em>).
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setSelectedTags([]);
                setSelectedFilterOption('ALL');
                setColumnMapping({});
                setIsMappingStudioOpen(false);
                setNewTagInput('');
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Choose Different File
            </button>

            <button
              onClick={handleUploadTrigger}
              disabled={isProcessing || finalRowsToUpload.length === 0}
              className="px-7 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Dataset & Merging...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload & Merge ({finalRowsToUpload.length.toLocaleString()} Records)
                  {selectedTags.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                      {selectedTags.length} {selectedTags.length === 1 ? 'Tag' : 'Tags'}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
