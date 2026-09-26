import { useEffect } from 'react';
import { NavTab } from '../components/layout/Sidebar';

interface UseKeyboardShortcutsProps {
  onOpenComposer: () => void;
  onFocusSearch: () => void;
  onSelectTab: (tab: NavTab) => void;
  onToggleShortcutsModal: () => void;
  onCloseModals: () => void;
  isAnyModalOpen: boolean;
}

export function useKeyboardShortcuts({
  onOpenComposer,
  onFocusSearch,
  onSelectTab,
  onToggleShortcutsModal,
  onCloseModals,
  isAnyModalOpen,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Handle Escape globally
      if (e.key === 'Escape') {
        if (isInput) {
          (target as HTMLElement).blur();
        }
        onCloseModals();
        return;
      }

      // If user is currently typing in an input or textarea, don't trigger navigation or letter shortcuts
      if (isInput) {
        return;
      }

      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onFocusSearch();
        return;
      }

      // Disregard other Cmd/Ctrl/Alt combinations so browser shortcuts still work
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Single-key shortcuts
      switch (e.key.toLowerCase()) {
        case 'c':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onOpenComposer();
          }
          break;

        case 's':
        case '/':
          e.preventDefault();
          onFocusSearch();
          break;

        case '?':
          e.preventDefault();
          onToggleShortcutsModal();
          break;

        case '1':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onSelectTab('overview');
          }
          break;

        case '2':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onSelectTab('calendar');
          }
          break;

        case '3':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onSelectTab('queue');
          }
          break;

        case '4':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onSelectTab('analytics');
          }
          break;

        case '5':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onSelectTab('inbox');
          }
          break;

        case '6':
          if (!isAnyModalOpen) {
            e.preventDefault();
            onSelectTab('accounts');
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onOpenComposer,
    onFocusSearch,
    onSelectTab,
    onToggleShortcutsModal,
    onCloseModals,
    isAnyModalOpen,
  ]);
}
