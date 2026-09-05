'use client';

import React from 'react';
import {
  SlidersHorizontal,
  Phone,
  User,
  Mail,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Tag,
  Folder,
  Activity,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Info,
} from 'lucide-react';

export interface ColumnMappingItem {
  sourceColumn: string;
  targetField: string;
  sampleValues: any[];
}

export const TARGET_SYSTEM_FIELDS = [
  { value: 'phone', label: '📞 Phone / Mobile Number (Key)', icon: Phone, color: 'text-emerald-600 dark:text-emerald-400', isKey: true },
  { value: 'name', label: '👤 Full Name / Nickname', icon: User, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'email', label: '✉️ Email Address', icon: Mail, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'avatarUrl', label: '🖼️ Avatar / Photo URL', icon: ImageIcon, color: 'text-pink-600 dark:text-pink-400' },
  { value: 'avatarType', label: '🎨 Avatar Type (With/Without)', icon: ImageIcon, color: 'text-pink-500 dark:text-pink-400' },
  { value: 'age', label: '🎂 Age (Years)', icon: Calendar, color: 'text-amber-600 dark:text-amber-400' },
  { value: 'gender', label: '⚧ Gender (Male/Female/Other)', icon: User, color: 'text-indigo-600 dark:text-indigo-400' },
  { value: 'location', label: '📍 Location / City / District', icon: MapPin, color: 'text-teal-600 dark:text-teal-400' },
  { value: 'area', label: '🏘️ Area / Thana / Zone', icon: MapPin, color: 'text-teal-500 dark:text-teal-400' },
  { value: 'address', label: '🏠 Full Street Address', icon: MapPin, color: 'text-teal-600 dark:text-teal-400' },
  { value: 'tags', label: '🏷️ Tags / Batch Labels (Comma-separated)', icon: Tag, color: 'text-brand-600 dark:text-brand-400' },
  { value: 'category', label: '📁 Category / Segment', icon: Folder, color: 'text-brand-500 dark:text-brand-400' },
  { value: 'status', label: '⚡ Status (Active / Inactive)', icon: Shield, color: 'text-emerald-500 dark:text-emerald-400' },
  { value: 'activeDays', label: '📅 Active Days (Number)', icon: Activity, color: 'text-orange-600 dark:text-orange-400' },
  { value: 'lastActive', label: '🕒 Last Online / Timestamp', icon: Clock, color: 'text-sky-600 dark:text-sky-400' },
  { value: 'custom', label: '🧩 Custom Field (Keep as Attribute)', icon: Layers, color: 'text-gray-600 dark:text-gray-400' },
  { value: 'skip', label: '🚫 Skip / Ignore Column', icon: AlertTriangle, color: 'text-rose-500 dark:text-rose-400' },
];

export function getAutoSuggestedField(columnName: string, sampleValues: any[] = []): string {
  const lk = columnName.toLowerCase().replace(/[\s_\.-]+/g, '');

  if (['phone', 'mobile', 'number', 'cell', 'contact', 'tel', 'msisdn', 'phonenumber', 'mobilenumber', 'contactno'].includes(lk)) return 'phone';
  if (['name', 'fullname', 'username', 'nickname', 'nick', 'contactname', 'customername', 'person', 'title'].includes(lk)) return 'name';
  if (['email', 'mail', 'emailaddress', 'useremail'].includes(lk)) return 'email';
  if (['avatar', 'photo', 'image', 'picture', 'avatarurl', 'userphoto', 'imageurl', 'photourl', 'userimage'].includes(lk)) return 'avatarUrl';
  if (['avatartype', 'avatarcategory', 'imagetype'].includes(lk)) return 'avatarType';
  if (['age', 'years', 'userage'].includes(lk)) return 'age';
  if (['gender', 'sex'].includes(lk)) return 'gender';
  if (['location', 'district', 'city', 'division', 'state', 'country'].includes(lk)) return 'location';
  if (['area', 'thana', 'zone', 'subdistrict', 'upazila'].includes(lk)) return 'area';
  if (['address', 'fulladdress', 'street', 'presentaddress', 'permanentaddress'].includes(lk)) return 'address';
  if (['tag', 'tags', 'label', 'labels', 'badge'].includes(lk)) return 'tags';
  if (['category', 'group', 'segment', 'batch'].includes(lk)) return 'category';
  if (['status', 'accountstatus', 'state', 'userstatus'].includes(lk)) return 'status';
  if (['activedays', 'days', 'active', 'activeday'].includes(lk)) return 'activeDays';
  if (['lastonline', 'lastactive', 'online', 'date', 'timestamp', 'lastseen', 'lastactivity'].includes(lk)) return 'lastActive';

  // Sample values heuristic inspection
  for (const v of sampleValues) {
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    const cleanPhone = s.replace(/[\s\+\-\(\)]/g, '');
    if (cleanPhone.length >= 7 && /^\d+$/.test(cleanPhone) && (cleanPhone.startsWith('88') || cleanPhone.startsWith('01') || cleanPhone.startsWith('1') || cleanPhone.startsWith('0'))) {
      return 'phone';
    }
    if (s.startsWith('http://') || s.startsWith('https://')) {
      if (/\.(jpg|jpeg|png|webp|gif|svg)/i.test(s) || s.includes('avatar') || s.includes('photo') || s.includes('image')) {
        return 'avatarUrl';
      }
    }
    if (s.includes('@') && s.includes('.') && s.length >= 6) {
      return 'email';
    }
  }

  return 'custom';
}

interface ColumnMappingStudioProps {
  columnNames: string[];
  sampleRows: any[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function ColumnMappingStudio({
  columnNames,
  sampleRows,
  mapping,
  onMappingChange,
  isOpen,
  onToggleOpen,
}: ColumnMappingStudioProps) {
  const handleFieldSelect = (columnName: string, targetField: string) => {
    onMappingChange({
      ...mapping,
      [columnName]: targetField,
    });
  };

  const handleResetToAuto = () => {
    const autoMap: Record<string, string> = {};
    columnNames.forEach((col) => {
      const samples = sampleRows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
      autoMap[col] = getAutoSuggestedField(col, samples);
    });
    onMappingChange(autoMap);
  };

  const phoneMappedColumn = columnNames.find((col) => mapping[col] === 'phone');
  const totalMapped = Object.values(mapping).filter((v) => v !== 'skip').length;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200">
      {/* Collapsible Header */}
      <div
        onClick={onToggleOpen}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 flex items-center justify-center shrink-0 shadow-xs">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Custom Column Mapping Studio
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-[10px] uppercase tracking-wider">
                {isOpen ? 'Customizing' : 'Auto-Mapped'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isOpen
                ? 'Select or adjust how each column in your file connects to database fields.'
                : `Smart auto-mapping active (${totalMapped} of ${columnNames.length} columns mapped). Click to customize.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {phoneMappedColumn ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[11px] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Phone: &ldquo;{phoneMappedColumn}&rdquo;</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[11px] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>No Phone Selected</span>
            </span>
          )}

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 text-xs font-bold shadow-2xs hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {isOpen ? 'Collapse ▴' : 'Customize ▾'}
          </button>
        </div>
      </div>

      {/* Expanded Mapping Table & Controls */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in fade-in duration-200">
          {/* Top Info and Reset Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
              <span>
                Backend will automatically process and sanitize data according to your customized field mappings.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToAuto}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-50 transition-colors self-start sm:self-center shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Auto-Detect</span>
            </button>
          </div>

          {/* Mapping Grid / Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/90 dark:bg-slate-800/90 text-gray-600 dark:text-gray-300 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200 dark:border-slate-700">
                  <th className="py-3 px-4 w-1/3">Source File Column</th>
                  <th className="py-3 px-4 w-1/3">Sample Values (First Rows)</th>
                  <th className="py-3 px-4 w-1/3">Mapped System Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {columnNames.map((colName, idx) => {
                  const currentField = mapping[colName] || 'custom';
                  const matchedFieldDef = TARGET_SYSTEM_FIELDS.find((f) => f.value === currentField) || TARGET_SYSTEM_FIELDS[0];
                  const Icon = matchedFieldDef.icon;

                  // Extract sample values for this column
                  const samples = sampleRows
                    .map((r) => r[colName])
                    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
                    .slice(0, 3);

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Source Column Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-mono text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-xs">{colName}</span>
                        </div>
                      </td>

                      {/* Sample Values Preview */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {samples.length > 0 ? (
                            samples.map((sVal, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-mono text-[11px] truncate max-w-[140px] border border-gray-200/80 dark:border-slate-700"
                                title={String(sVal)}
                              >
                                {String(sVal)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic text-[11px]">
                              Empty in sample rows
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dropdown Selector */}
                      <td className="py-3 px-4">
                        <div className="relative">
                          <select
                            value={currentField}
                            onChange={(e) => handleFieldSelect(colName, e.target.value)}
                            className={`w-full py-2 pl-3 pr-8 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-2xs ${
                              currentField === 'phone'
                                ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30'
                                : currentField === 'skip'
                                ? 'border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
                                : currentField === 'custom'
                                ? 'border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                                : 'border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 bg-brand-50/30 dark:bg-brand-950/20'
                            }`}
                          >
                            {TARGET_SYSTEM_FIELDS.map((target) => (
                              <option
                                key={target.value}
                                value={target.value}
                                className="text-gray-900 dark:text-white bg-white dark:bg-slate-900 font-medium py-1"
                              >
                                {target.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Live Mapping Summary Pill */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Unmapped or &apos;Custom&apos; columns will be preserved inside each contact&apos;s custom attributes drawer.
              </span>
            </span>
            <span className="font-bold text-gray-700 dark:text-gray-300">
              Total {columnNames.length} Columns Configured
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
