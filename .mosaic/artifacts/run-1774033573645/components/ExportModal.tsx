import React, { useState, useCallback } from 'react';

export type ExportFormat = 'hh_text' | 'json';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, handIds?: string[]) => void;
  selectedHandIds?: string[];
}

type ExportScope = 'selected' | 'all';

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  selectedHandIds = [],
}) => {
  const [format, setFormat] = useState<ExportFormat>('hh_text');
  const [scope, setScope] = useState<ExportScope>(
    selectedHandIds.length > 0 ? 'selected' : 'all'
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const handIds = scope === 'selected' ? selectedHandIds : undefined;
      await onExport(format, handIds);
      onClose();
    } finally {
      setIsExporting(false);
    }
  }, [format, scope, selectedHandIds, onExport, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  const hasSelection = selectedHandIds.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">导出手牌记录</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
            aria-label="关闭"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-5">
          {/* Format Selection */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 mb-2">导出格式</legend>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                  format === 'hh_text'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="hh_text"
                  checked={format === 'hh_text'}
                  onChange={() => setFormat('hh_text')}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">HH 文本格式</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    标准 Hand History 格式，兼容 PokerTracker、Hold'em Manager 等分析工具
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">JSON 格式</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    完整结构化数据，包含 GTO 分析信息，适合自定义数据处理
                  </p>
                </div>
              </label>
            </div>
          </fieldset>

          {/* Scope Selection */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 mb-2">导出范围</legend>
            <div className="space-y-2">
              {hasSelection && (
                <label
                  className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                    scope === 'selected'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value="selected"
                    checked={scope === 'selected'}
                    onChange={() => setScope('selected')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">已选手牌</span>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {selectedHandIds.length} 手
                    </span>
                  </div>
                </label>
              )}

              <label
                className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                  scope === 'all'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">全部手牌</span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                导出中…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;