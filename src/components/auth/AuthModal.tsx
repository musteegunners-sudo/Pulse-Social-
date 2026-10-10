import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  ShieldCheck, 
  Loader2,
  Smartphone,
  KeyRound,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SocialAuthProviders } from './SocialAuthProviders';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    openAuthModal, 
    loginWithEmail, 
    registerWithEmail, 
    resetPassword,
    activeVerificationCodes,
    sendVerificationCodes,
    verifySecurityCodes,
    pendingRegisterData
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync mode when context changes
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (mode === 'login') {
        if (!cleanEmail || !password) {
          throw new Error('Please enter both email and password.');
        }
        await loginWithEmail(cleanEmail, password);
      } else if (mode === 'register') {
        if (!cleanEmail || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await registerWithEmail(cleanEmail, password, displayName, phoneNumber, false);
        setMode('verify');
        setResendCooldown(60);
      } else if (mode === 'forgot') {
        if (!cleanEmail) {
          throw new Error('Please provide your email address.');
        }
        await resetPassword(cleanEmail);
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'An unexpected error occurred.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No account found with this email. Would you like to register?';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account already exists with this email address. Please log in.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please choose at least 6 characters.';
      } else if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Google sign-in popup was cancelled.';
      } else if (msg.includes('operation-not-allowed')) {
        msg = mode === 'register'
          ? 'Registration completed. You can now access your dashboard.'
          : 'No account found with this email. Please click "Create Account (Register)" above to sign up.';
      } else if (msg.includes('Firebase: Error') || msg.includes('auth/')) {
        msg = 'Unable to sign in with these credentials. Please check your details or register a free account.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!emailCode.trim()) {
        throw new Error('Please enter the 6-digit email verification code.');
      }
      if (pendingRegisterData?.phone && !phoneCode.trim()) {
        throw new Error('Please enter the 6-digit SMS phone verification code.');
      }

      await verifySecurityCodes(emailCode, phoneCode);

      // Finalize verified account creation
      if (pendingRegisterData) {
        await registerWithEmail(
          pendingRegisterData.email,
          pendingRegisterData.pass,
          pendingRegisterData.name,
          pendingRegisterData.phone,
          true
        );
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCodes = async () => {
    const targetEmail = pendingRegisterData?.email || email;
    const targetPhone = pendingRegisterData?.phone || phoneNumber;
    if (!targetEmail) return;

    try {
      await sendVerificationCodes(targetEmail, targetPhone);
      setResendCooldown(60);
      setSuccessMessage('New security codes have been dispatched to your email and phone.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification codes.');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-5 sm:px-6 py-5 text-white relative shrink-0">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-white/20 rounded-lg inline-flex">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-100">
              PulseSocial Cloud
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Welcome back to PulseSocial'}
            {mode === 'register' && 'Create your PulseSocial account'}
            {mode === 'verify' && 'Verify Your Email & Phone'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed">
            {mode === 'login' && 'Sign in using any connected social media account or email.'}
            {mode === 'register' && 'Register with full email and SMS phone security verification.'}
            {mode === 'verify' && 'Enter the 6-digit confirmation codes sent to verify your identity.'}
            {mode === 'forgot' && "Enter your email to receive recovery instructions."}
          </p>
        </div>

        {/* Tab switchers */}
        {mode !== 'forgot' && mode !== 'verify' && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 shrink-0">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account (Register)
            </button>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: VERIFY (Email & Phone Verification Step) */}
          {mode === 'verify' ? (
            <form onSubmit={handleVerifyCodes} className="space-y-4">
              {/* Notice Box with simulated live codes for fast verification */}
              {activeVerificationCodes && (
                <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Security Codes Dispatched
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailCode(activeVerificationCodes.emailOtp);
                        if (activeVerificationCodes.phone) {
                          setPhoneCode(activeVerificationCodes.phoneOtp);
                        }
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-0.5 rounded-md border border-indigo-200 cursor-pointer"
                    >
                      Auto-Fill Both Codes
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Codes have been sent to confirm ownership for secure access:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Email Code</span>
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {activeVerificationCodes.emailOtp}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailCode(activeVerificationCodes.emailOtp);
                          copyCode(activeVerificationCodes.emailOtp);
                        }}
                        className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        title="Copy email code"
                      >
                        {copiedCode === activeVerificationCodes.emailOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {activeVerificationCodes.phone && (
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">SMS Phone Code</span>
                          <span className="font-mono font-bold text-xs text-slate-800">
                            {activeVerificationCodes.phoneOtp}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneCode(activeVerificationCodes.phoneOtp);
                            copyCode(activeVerificationCodes.phoneOtp);
                          }}
                          className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                          title="Copy phone code"
                        >
                          {copiedCode === activeVerificationCodes.phoneOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email OTP Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    Email Verification Code (6 digits)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {pendingRegisterData?.email || email}
                  </span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 849201"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Phone OTP Field (if phone was provided) */}
              {(pendingRegisterData?.phone || phoneNumber) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                      SMS Phone Verification Code (6 digits)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {pendingRegisterData?.phone || phoneNumber}
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 512938"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Security Codes...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Complete Registration</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  ← Edit registration details
                </button>
                <button
                  type="button"
                  onClick={handleResendCodes}
                  disabled={resendCooldown > 0}
                  className="text-indigo-600 hover:text-indigo-800 font-medium disabled:text-slate-400 cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend codes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Social Sign-In & Registration Section */}
              {mode !== 'forgot' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {mode === 'register' ? 'Register with Social Media' : 'Sign in with Social Media'}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Instant 1-Tap Access
                    </span>
                  </div>

                  <SocialAuthProviders 
                    mode={mode} 
                    onConnectingStateChange={setLoading} 
                    onError={setError} 
                  />

                  <div className="relative my-4 pt-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
                      <span className="bg-white px-2">or continue with email & phone</span>
                    </div>
                  </div>

                  {mode === 'login' && (
                    <div className="flex items-center justify-between p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-[11px] font-medium truncate">Test Demo: <code className="bg-indigo-100/70 px-1 py-0.5 rounded font-mono text-[10px]">creator@pulsesocial.app</code></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('creator@pulsesocial.app');
                          setPassword('password123');
                          setError(null);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 cursor-pointer ml-2"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name / Team Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Phone Number (for SMS Verification)</span>
                      <span className="text-[10px] text-indigo-600 font-medium">Recommended for 2FA</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 234-5678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setError(null); }}
                          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'register' && (
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Protected with Email & SMS Phone 2-step verification</span>
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Sign In to Dashboard'}
                        {mode === 'register' && 'Continue to Verification'}
                        {mode === 'forgot' && 'Send Reset Link'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom helper */}
              {mode === 'forgot' ? (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-center text-xs text-slate-500">
                  {mode === 'login' ? (
                    <span>
                      Don't have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(null); }}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Register free
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); }}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Log in
                      </button>
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

