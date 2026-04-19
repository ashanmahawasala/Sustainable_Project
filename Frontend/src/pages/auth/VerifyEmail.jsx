import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TRUST_POINTS = ['Secure email verification', 'Fast OTP delivery', 'Instant account access'];

const VERIFICATION_BENEFITS = [
  {
    title: 'Secure onboarding',
    description: 'Verify your email before accessing your EcoCycle dashboard.',
  },
  {
    title: 'Session ready',
    description: 'Your account is linked to the same authenticated session flow.',
  },
  {
    title: 'Quick recovery',
    description: 'Resend OTP anytime if the email takes a moment to arrive.',
  },
];

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-cubic',
      offset: 80,
    });
  }, []);

  useEffect(() => {
    // Get email from localStorage if available
    const registeredEmail = localStorage.getItem('registeredEmail');
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, []);

  // Timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Concatenate OTP
  const otpValue = otp.join('');

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (otpValue.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/users/verify-email', {
        email,
        otp: otpValue,
      });

      setSuccessMessage('Email verified successfully! Redirecting to dashboard...');
      
      // Store token and user data using context
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      }
      
      // Clear stored email
      localStorage.removeItem('registeredEmail');

      // Redirect to user dashboard after 2 seconds
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    setResendLoading(true);

    try {
      await API.post('/users/resend-otp', { email });
      
      setSuccessMessage('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60); // 60 seconds timer
      
      // Auto-focus first OTP input
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setErrorMessage(message);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_26%),linear-gradient(135deg,#020617_0%,#052e2b_48%,#082f49_100%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-4xl border border-white/10 bg-white/95 shadow-[0_30px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-800 to-cyan-700 p-12 text-white lg:flex">
            <div className="absolute -left-16 top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-6 right-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3" data-aos="fade-down">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-md">
                  <div className="h-7 w-7 rounded-xl bg-linear-to-br from-emerald-200 to-cyan-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">EcoCycle</p>
                  <h2 className="text-2xl font-semibold">Verification Center</h2>
                </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="100">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-emerald-50 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  Confirm your email to unlock the full platform
                </span>
                <h3 className="max-w-xl text-5xl font-semibold leading-tight">
                  One quick step before your EcoCycle dashboard is ready.
                </h3>
                <p className="mt-6 max-w-lg text-lg leading-8 text-emerald-50/90">
                  Enter the 6-digit code we sent to your email, and we’ll securely activate your account.
                </p>
              </div>

              <div className="mt-10 space-y-5" data-aos="fade-up" data-aos-delay="180">
                {VERIFICATION_BENEFITS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-emerald-50/85">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8" data-aos="fade-up" data-aos-delay="260">
              <div>
                <div className="text-3xl font-semibold">OTP</div>
                <p className="mt-1 text-sm text-emerald-50/80">Secure code</p>
              </div>
              <div>
                <div className="text-3xl font-semibold">60s</div>
                <p className="mt-1 text-sm text-emerald-50/80">Resend window</p>
              </div>
              <div>
                <div className="text-3xl font-semibold">1 click</div>
                <p className="mt-1 text-sm text-emerald-50/80">Dashboard access</p>
              </div>
            </div>
          </aside>

          <section className="relative bg-white px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-emerald-100/60 blur-3xl" />
            <div className="absolute bottom-10 left-6 h-24 w-24 rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-xl" data-aos="fade-up">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Verify email</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Enter your OTP code</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    We sent a 6-digit verification code to your registered email address.
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700 shadow-sm sm:flex">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-3">
                {TRUST_POINTS.map((point) => (
                  <span
                    key={point}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    {point}
                  </span>
                ))}
              </div>

              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                {email ? (
                  <>
                    <p className="text-xs font-medium text-slate-600">Verification code sent to</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{email}</p>
                    <button
                      onClick={() => setEmail('')}
                      className="mt-2 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                    >
                      Change email
                    </button>
                  </>
                ) : (
                  <>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Enter email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </>
                )}
              </div>

              {successMessage && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="mb-4 block text-sm font-semibold text-slate-900">
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-3 sm:gap-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-14 w-12 rounded-2xl border border-slate-200 bg-slate-50 text-center text-xl font-semibold text-slate-900 shadow-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpValue.length !== 6}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 via-emerald-700 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-700/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify email
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Didn't receive the code?</p>
                    <p className="mt-1 text-sm text-slate-600">You can resend a new OTP if the current one expires or gets delayed.</p>
                  </div>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendLoading || resendTimer > 0}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {resendLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : resendTimer > 0 ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Resend in {resendTimer}s
                      </>
                    ) : (
                      'Resend code'
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                If you do not see the email, check your spam folder or request a new code.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
