import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { SocialAccount, SocialPlatform } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { 
  parseAccountsCsv, 
  generateSampleCsvTemplate, 
  CsvParseResult, 
  ParsedAccountRow 
} from '../../utils/csvAccountParser';

interface CsvAccountsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: SocialAccount[];
  onImport: (
    accounts: SocialAccount[],
    mode: 'merge' | 'replace' | 'skip_duplicates',
    summary: { added: number; updated: number }
  ) => void;
}

export const CsvAccountsImportModal: React.FC<CsvAccountsImportModalProps> = ({
  isOpen,
  onClose,
  existingAccounts,
  onImport,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'skip_duplicates' | 'replace'>('merge');
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);
  const [filterPreview, setFilterPreview] = useState<'all' | 'valid' | 'errors'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute parsed result from current CSV text
  const parseResult: CsvParseResult = useMemo(() => {
    if (!csvText.trim()) {
      return {
        rows: [],
        totalRows: 0,
        validCount: 0,
        errorCount: 0,
        duplicateCount: 0,
        detectedHeaders: [],
      };
    }
    return parseAccountsCsv(csvText, existingAccounts);
  }, [csvText, existingAccounts]);

  if (!isOpen) return null;

  // Handle file reading
  const handleFileProcess = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Download sample template
  const handleDownloadSample = () => {
    const sample = generateSampleCsvTemplate();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pulsesocial_accounts_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick load sample into editor
  const handleLoadSampleData = () => {
    const sample = generateSampleCsvTemplate();
    setCsvText(sample);
    setFileName('pulsesocial_sample_accounts.csv');
    setFileSize('1.2 KB');
  };

  // Clear loaded CSV
  const handleClear = () => {
    setCsvText('');
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter rows for preview
  const displayRows = parseResult.rows.filter(r => {
    if (filterPreview === 'valid') return r.isValid;
    if (filterPreview === 'errors') return !r.isValid;
    return true;
  });

  // Calculate accounts to import
  const validAccountsToImport: SocialAccount[] = parseResult.rows
    .filter(r => r.isValid && r.account)
    .map(r => r.account!);

  // Import button action
  const handleConfirmImport = () => {
    if (validAccountsToImport.length === 0) return;

    let addedCount = 0;
    let updatedCount = 0;

    if (importMode === 'replace') {
      addedCount = validAccountsToImport.length;
    } else {
      validAccountsToImport.forEach(acc => {
        const isMatch = existingAccounts.some(
          curr => curr.platform === acc.platform && curr.handle.toLowerCase() === acc.handle.toLowerCase()
        );
        if (isMatch) {
          if (importMode === 'merge') updatedCount++;
        } else {
          addedCount++;
        }
      });
    }

    onImport(validAccountsToImport, importMode, { added: addedCount, updated: updatedCount });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                Bulk Import Social Accounts
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                Upload CSV spreadsheet to batch-provision channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownloadSample}
              className="min-h-[40px] sm:min-h-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Download preformatted CSV template with example columns"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sample Template</span>
              <span className="sm:hidden">Template</span>
            </button>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 min-h-0">
          
          {/* Input Method Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeMode === 'upload' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV File</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('paste')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeMode === 'paste' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste CSV Text</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleLoadSampleData}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-fill Demo CSV Data</span>
            </button>
          </div>

          {/* Mode 1: Drag & Drop File Upload */}
          {activeMode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {fileName ? (
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{fileName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {fileSize} · {parseResult.totalRows} records parsed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Choose Different File
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to browse or drop your CSV file here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Accepts standard RFC-4180 .csv files up to 5MB
                  </p>
                  <div className="inline-block mt-3 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs hover:bg-slate-50">
                    Select File from Device
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Paste Raw CSV Text */}
          {activeMode === 'paste' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Paste raw comma-separated values (first row must be column headers):</span>
                {csvText && (
                  <button onClick={handleClear} className="text-red-600 hover:underline cursor-pointer">
                    Clear text
                  </button>
                )}
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="platform,handle,name,followers,status&#10;twitter,@acme_hq,Acme HQ,45000,active&#10;linkedin,acme-inc,Acme Inc,82000,active"
                rows={6}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-y"
              />
            </div>
          )}

          {/* Format Guide Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supported Columns & Aliases:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
              <div><strong className="text-slate-700">platform:</strong> twitter (x), linkedin, instagram, facebook, tiktok</div>
              <div><strong className="text-slate-700">handle:</strong> e.g. @company or company_profile</div>
              <div><strong className="text-slate-700">name:</strong> display name or brand title</div>
              <div><strong className="text-slate-700">followers:</strong> 45000, 45k, or 1.2M</div>
              <div><strong className="text-slate-700">status:</strong> active / paused / connected / true</div>
              <div><strong className="text-slate-700">avatar_url:</strong> optional custom profile image URL</div>
            </div>
          </div>

          {/* Configuration & Conflict Strategy */}
          {parseResult.totalRows > 0 && (
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-900">
                  Duplicate & Conflict Resolution:
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span><strong>Update Existing</strong> (Merge details)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="skip_duplicates"
                      checked={importMode === 'skip_duplicates'}
                      onChange={() => setImportMode('skip_duplicates')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span><strong>Skip Existing</strong> (New only)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-red-700 font-medium">Replace Entire Directory</span>
                  </label>
                </div>
              </div>

              {parseResult.errorCount > 0 && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipInvalidRows}
                      onChange={(e) => setSkipInvalidRows(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ignore {parseResult.errorCount} row(s) with errors and import all {parseResult.validCount} valid accounts</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Validation Summary & Live Preview Table */}
          {parseResult.totalRows > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">Parsed Accounts Preview</span>
                  <span className="text-slate-400">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {parseResult.validCount} valid
                  </span>
                  {parseResult.errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded font-mono font-medium">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      {parseResult.errorCount} errors
                    </span>
                  )}
                  {parseResult.duplicateCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono font-medium">
                      {parseResult.duplicateCount} existing match
                    </span>
                  )}
                </div>

                {/* Filter toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setFilterPreview('all')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      filterPreview === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    All ({parseResult.totalRows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPreview('valid')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      filterPreview === 'valid' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Valid Only ({parseResult.validCount})
                  </button>
                  {parseResult.errorCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterPreview('errors')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        filterPreview === 'errors' ? 'bg-white text-red-700 shadow-2xs font-semibold' : 'text-slate-600'
                      }`}
                    >
                      Errors ({parseResult.errorCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Grid Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-3">Network</th>
                      <th className="py-2 px-3">Profile Name & Handle</th>
                      <th className="py-2 px-3 text-right">Followers</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Sync Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayRows.map((row) => {
                      const acc = row.account;
                      return (
                        <tr
                          key={row.rowIndex}
                          className={`transition-colors ${
                            !row.isValid ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Row Index / Status Icon */}
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                            {row.isValid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            )}
                          </td>

                          {/* Network */}
                          <td className="py-2 px-3">
                            {acc?.platform ? (
                              <div className="flex items-center gap-1.5">
                                <PlatformIcon platform={acc.platform} size={13} />
                                <span className="font-semibold text-slate-800">
                                  {getPlatformName(acc.platform)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-red-600 font-mono text-[11px]">
                                {row.rawValues['platform'] || 'missing'}
                              </span>
                            )}
                          </td>

                          {/* Handle & Name */}
                          <td className="py-2 px-3">
                            {acc ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={acc.avatarUrl}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-100"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block leading-tight">
                                    {acc.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                                    {acc.handle}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-600 text-[11px] space-y-0.5">
                                <span className="font-mono">{row.rawValues['handle'] || '(no handle)'}</span>
                                {row.errors.map((err, eIdx) => (
                                  <div key={eIdx} className="text-[10px] text-red-700">
                                    • {err}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Followers */}
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                            {acc ? acc.followersCount.toLocaleString() : '-'}
                          </td>

                          {/* Status */}
                          <td className="py-2 px-3">
                            {acc ? (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                acc.isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${acc.isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span>{acc.isConnected ? 'Active' : 'Paused'}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Sync Action */}
                          <td className="py-2 px-3">
                            {row.matchedExisting ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                {importMode === 'merge' ? 'Updates Existing' : importMode === 'skip_duplicates' ? 'Skipped' : 'Overwrites'}
                              </span>
                            ) : row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                + New Account
                              </span>
                            ) : (
                              <span className="text-[10px] text-red-600 font-semibold">
                                Error
                              </span>
                            )}
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

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {validAccountsToImport.length > 0 ? (
              <span>
                Ready to import <strong className="text-slate-900">{validAccountsToImport.length}</strong> accounts
                {importMode === 'replace' ? ' (will overwrite existing directory)' : ''}
              </span>
            ) : (
              <span>Upload or paste CSV data to inspect accounts</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validAccountsToImport.length === 0 || (!skipInvalidRows && parseResult.errorCount > 0)}
              onClick={handleConfirmImport}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Import {validAccountsToImport.length} Account{validAccountsToImport.length === 1 ? '' : 's'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
