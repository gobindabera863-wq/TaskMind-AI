import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleDigitChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input field
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      return setError('Please enter all 6 digits of the OTP code.');
    }

    setSubmitting(true);

    try {
      await verifyOTP(email, otpCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setMessage('');

    try {
      await resendOTP(email);
      setMessage('A new 6-digit OTP code has been sent to your email.');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl z-10 text-center">
        {/* Header */}
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Email Verification</h2>
        <p className="text-xs text-slate-400 mt-1">
          We sent a 6-digit OTP verification code to:
        </p>
        <p className="text-sm font-bold text-indigo-400 mt-0.5 mb-6">{email || 'your email'}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
            <span>✨ {message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-Digit OTP Inputs */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-center text-xl font-extrabold text-white rounded-xl outline-none shadow-inner transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || otp.join('').length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Verifying...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
          <span>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="flex items-center gap-1 font-bold text-indigo-400 hover:underline disabled:opacity-40 disabled:no-underline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? 'animate-spin' : ''}`} />
            <span>{canResend ? 'Resend OTP' : `Resend in ${timer}s`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
