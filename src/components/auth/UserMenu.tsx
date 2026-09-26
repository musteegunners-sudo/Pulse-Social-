import React, { useState, useRef, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles, 
  Mail,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  variant?: 'header' | 'sidebar';
}

export const UserMenu: React.FC<UserMenuProps> = ({ variant = 'header' }) => {
  const { user, profile, loading, openAuthModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
    );
  }

  // Not signed in state
  if (!user) {
    if (variant === 'sidebar') {
      return (
        <div className="p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/80 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-semibold text-indigo-950">Guest Mode</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Sign in to sync your social accounts and access scheduled posts across devices.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openAuthModal('login')}
              className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer text-center"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => openAuthModal('login')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Log In</span>
        </button>
        <button
          onClick={() => openAuthModal('register')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Register</span>
        </button>
      </div>
    );
  }

  // Signed in state
  const displayName = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const photo = profile?.photoURL || user.photoURL;

  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer bg-white"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {photo ? (
            <img
              src={photo}
              alt={displayName}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
              {initials || <UserIcon className="w-4 h-4" />}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight max-w-[120px]">
          <span className="text-xs font-semibold text-slate-800 truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            {email}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User profile card */}
          <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="relative">
                {photo ? (
                  <img
                    src={photo}
                    alt={displayName}
                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] bg-indigo-50/80 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>Verified Cloud Session</span>
              </span>
              <span className="font-semibold">Active</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Profile</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">UID: {user.uid.slice(0, 6)}…</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-medium disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>{loggingOut ? 'Signing out...' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
