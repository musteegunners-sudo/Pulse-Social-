import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  KeyRound,
  Sparkles,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SecurityModal: React.FC = () => {
  const { 
    isSecurityModalOpen, 
    closeSecurityModal, 
    profile, 
    user,
    sendVerificationCodes,
    verifySecurityCodes,
    activeVerificationCodes,
    updateSecuritySettings
  } = useAuth();

  const activeEmail = profile?.email || user?.email || '';
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [emailStep, setEmailStep] = useState<'idle' | 'codeSent' | 'success'>('idle');
  const [phoneStep, setPhoneStep] = useState<'idle' | 'codeSent' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync profile data when opened
  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile, isSecurityModalOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isSecurityModalOpen) return null;

  const isEmailVerified = profile?.emailVerified ?? false;
  const isPhoneVerified = profile?.phoneVerified ?? (!!profile?.phoneNumber);
  const is2FA = profile?.twoFactorEnabled ?? false;

  // Calculate security score
  let securityScore = 30;
  if (isEmailVerified) securityScore += 35;
  if (isPhoneVerified) securityScore += 25;
  if (is2FA) securityScore += 10;

  const handleSendEmailVerification = async () => {
    if (!activeEmail) return;
    setStatusMessage(null);
    try {
      const codes = await sendVerificationCodes(activeEmail, phoneNumber || undefined);
      setEmailStep('codeSent');
      setResendCooldown(60);
      setStatusMessage({
        type: 'success',
        text: `Security code sent to ${activeEmail}. Code: ${codes.emailOtp}`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send verification code.' });
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailCode) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit email code.' });
      return;
    }
    setVerifyingEmail(true);
    setStatusMessage(null);
    try {
      await verifySecurityCodes(emailCode);
      setEmailStep('success');
      setStatusMessage({ type: 'success', text: 'Email successfully verified and secured!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Invalid email verification code.' });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSendPhoneVerification = async () => {
    const clean = phoneNumber.trim();
    if (!clean) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid phone number.' });
      return;
    }
    setStatusMessage(null);
    try {
      const codes = await sendVerificationCodes(activeEmail, clean);
      setPhoneStep('codeSent');
      setResendCooldown(60);
      setStatusMessage({
        type: 'success',
        text: `SMS code dispatched to ${clean}. Code: ${codes.phoneOtp}`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send phone code.' });
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit phone code.' });
      return;
    }
    setVerifyingPhone(true);
    setStatusMessage(null);
    try {
      await verifySecurityCodes(activeVerificationCodes?.emailOtp || '123456', phoneCode);
      setPhoneStep('success');
      setStatusMessage({ type: 'success', text: 'Phone number successfully verified!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Invalid SMS verification code.' });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      await updateSecuritySettings({ twoFactorEnabled: !is2FA });
      setStatusMessage({
        type: 'success',
        text: !is2FA ? 'Two-Factor Authentication activated.' : 'Two-Factor Authentication disabled.'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to update 2FA settings.' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 sm:px-6 py-5 text-white relative shrink-0">
          <button
            onClick={closeSecurityModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close security modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg inline-flex border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
              Security & Identity Protection
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Email & Phone Verification
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Strengthen your PulseSocial creator account with multi-channel authentication.
          </p>

          {/* Security Progress Meter */}
          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Security Strength Score
              </span>
              <span className={`font-bold font-mono ${securityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {securityScore}% Protected
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  securityScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <div className="flex-1">
                <span>{statusMessage.text}</span>
              </div>
            </div>
          )}

          {/* Simulated Code Quick Banner */}
          {activeVerificationCodes && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Live Verification Dispatch Notice
                </span>
                <span className="text-[10px] text-indigo-600 font-mono font-medium">Valid 10m</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Codes dispatched for testing:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-indigo-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Email OTP</span>
                    <span className="font-mono font-bold text-sm text-slate-800 tracking-wider">
                      {activeVerificationCodes.emailOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailCode(activeVerificationCodes.emailOtp);
                      copyToClipboard(activeVerificationCodes.emailOtp);
                    }}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                    title="Paste into Email input"
                  >
                    {copiedCode === activeVerificationCodes.emailOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {activeVerificationCodes.phone && (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-indigo-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Phone SMS OTP</span>
                      <span className="font-mono font-bold text-sm text-slate-800 tracking-wider">
                        {activeVerificationCodes.phoneOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneCode(activeVerificationCodes.phoneOtp);
                        copyToClipboard(activeVerificationCodes.phoneOtp);
                      }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                      title="Paste into Phone input"
                    >
                      {copiedCode === activeVerificationCodes.phoneOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Email Verification */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Email Address</h4>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-[280px]">
                    {activeEmail || 'No email attached'}
                  </p>
                </div>
              </div>

              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Unverified
                </span>
              )}
            </div>

            {!isEmailVerified && (
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                {emailStep === 'idle' ? (
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-600">
                      Confirm ownership to secure post queues and account recovery.
                    </p>
                    <button
                      type="button"
                      onClick={handleSendEmailVerification}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      Send Code
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Enter 6-Digit Email Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 849201"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={verifyingEmail || emailCode.length < 6}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                      >
                        {verifyingEmail ? 'Checking...' : 'Verify Email'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Didn't receive it?</span>
                      <button
                        type="button"
                        onClick={handleSendEmailVerification}
                        disabled={resendCooldown > 0}
                        className="text-indigo-600 hover:text-indigo-800 font-medium disabled:text-slate-400 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Phone Verification */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">SMS Phone Number</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {profile?.phoneNumber || 'No phone number attached'}
                  </p>
                </div>
              </div>

              {isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Unverified
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2.5">
              {!isPhoneVerified || phoneStep === 'codeSent' ? (
                phoneStep === 'idle' ? (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Mobile / Phone Number with Country Code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 234-5678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendPhoneVerification}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                      >
                        Send SMS Code
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Enter 6-Digit SMS Phone Code sent to {phoneNumber}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 512938"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={verifyingPhone || phoneCode.length < 6}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                      >
                        {verifyingPhone ? 'Checking...' : 'Verify Phone'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <button
                        type="button"
                        onClick={() => setPhoneStep('idle')}
                        className="text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Change number
                      </button>
                      <button
                        type="button"
                        onClick={handleSendPhoneVerification}
                        disabled={resendCooldown > 0}
                        className="text-purple-600 hover:text-purple-800 font-medium disabled:text-slate-400 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend SMS in ${resendCooldown}s` : 'Resend SMS'}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Number verified for instant OTP log in & alerts</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('idle');
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Update Phone Number
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Two-Factor Authentication Toggle */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Require verified SMS or email confirmation on new sign-ins.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggle2FA}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 p-0.5 ${
                is2FA ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={is2FA}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                is2FA ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Encrypted with TLS 1.3 & Firebase</span>
          </span>
          <button
            type="button"
            onClick={closeSecurityModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
