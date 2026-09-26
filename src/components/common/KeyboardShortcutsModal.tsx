import React from 'react';
import { X, Keyboard, Sparkles, Compass, Command } from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenComposer: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenComposer,
}) => {
  if (!isOpen) return null;

  const navigationShortcuts: Array<{ keys: string[]; description: string; tab?: NavTab }> = [
    { keys: ['1'], description: 'Go to Dashboard', tab: 'overview' },
    { keys: ['2'], description: 'Go to Content Calendar', tab: 'calendar' },
    { keys: ['3'], description: 'Go to Publishing Queue', tab: 'queue' },
    { keys: ['4'], description: 'Go to Analytics & Metrics', tab: 'analytics' },
    { keys: ['5'], description: 'Go to Social Inbox', tab: 'inbox' },
    { keys: ['6'], description: 'Go to Connected Channels', tab: 'accounts' },
  ];

  const actionShortcuts: Array<{ keys: string[]; description: string; action?: () => void }> = [
    { keys: ['C'], description: 'Compose new cross-platform post', action: onOpenComposer },
    { keys: ['S', 'or', '/'], description: 'Focus global search input' },
    { keys: ['⌘', 'K'], description: 'Focus search bar shortcut' },
    { keys: ['?'], description: 'Open / close this shortcuts guide' },
    { keys: ['Esc'], description: 'Close modals & unfocus active input' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        {/* Topbar */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-sm font-bold text-slate-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500">
                Speed up your workflow with quick navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
            aria-label="Close keyboard shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Actions section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Actions & Workflow</span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl divide-y divide-slate-200/60">
              {actionShortcuts.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                      onClose();
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs ${
                    item.action ? 'hover:bg-indigo-50/50 cursor-pointer transition-colors' : ''
                  }`}
                >
                  <span className="text-slate-700 font-medium">{item.description}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, kIdx) => (
                      k === 'or' ? (
                        <span key={kIdx} className="text-[10px] text-slate-400 px-0.5">{k}</span>
                      ) : (
                        <kbd
                          key={kIdx}
                          className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-[11px] font-mono font-semibold text-slate-800 bg-white border border-slate-300 rounded shadow-2xs"
                        >
                          {k}
                        </kbd>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Jump Navigation section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Navigation Numbers</span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl divide-y divide-slate-200/60">
              {navigationShortcuts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (item.tab) {
                      onSelectTab(item.tab);
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-indigo-50/50 transition-colors cursor-pointer text-left"
                >
                  <span className="text-slate-700 font-medium">{item.description}</span>
                  <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-[11px] font-mono font-semibold text-slate-800 bg-white border border-slate-300 rounded shadow-2xs">
                    {item.keys[0]}
                  </kbd>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900">
            <span className="text-indigo-600 font-bold shrink-0">Tip:</span>
            <span>Single-letter shortcuts are paused while you are writing inside post editors and input boxes.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Press <kbd className="font-mono bg-white border border-slate-200 rounded px-1 text-[10px]">Esc</kbd> anytime to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
