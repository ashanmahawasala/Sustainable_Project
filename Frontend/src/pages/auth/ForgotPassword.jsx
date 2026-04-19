import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader,
  Mail,
  ShieldCheck,
  Sparkles,
  SparklesIcon,
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import API from '../../services/api';

const TRUST_POINTS = ['Secure reset flow', 'OTP verification', 'Fast account recovery'];

const RESET_BENEFITS = [
  {
    title: 'Recover access safely',
    description: 'Reset your password with a secure email code before creating a new one.',
  },
  {
    title: 'Stay in control',
    description: 'Continue using the same polished account experience after recovery.',
  },
  {
    title: 'Move back faster',
    description: 'A simple three-step flow helps you get back into your dashboard quickly.',
  },
];

// Password validation helper function
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 6,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(req => req);

  if (!allRequirementsMet) {
    const missingRequirements = [];
    if (!requirements.minLength) missingRequirements.push('at least 6 characters');
    if (!requirements.hasLowercase) missingRequirements.push('a lowercase letter');
    if (!requirements.hasUppercase) missingRequirements.push('an uppercase letter');
    if (!requirements.hasNumber) missingRequirements.push('a number');
    if (!requirements.hasSpecialChar) missingRequirements.push('a special character');

    return {
      isValid: false,
      message: `Password must contain: ${missingRequirements.join(', ')}`,
    };
  }

  return { isValid: true, message: '' };
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-cubic',
      offset: 80,
    });
  }, []);

  // Step 1: Validate and send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);

    try {
      await API.post('/users/forgot-password', { email });
      setSuccessMessage('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Store OTP for next step
      localStorage.setItem('resetOtp', otpValue);
      setSuccessMessage('OTP verified! Now reset your password.');
      setStep(3);
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');

    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const otpValue = localStorage.getItem('resetOtp');
      await API.post('/users/reset-password', {
        email,
        otp: otpValue,
        newPassword: password,
      });

      setSuccessMessage('Password reset successful! Redirecting to login...');
      localStorage.removeItem('resetOtp');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed. Please try again.';
      setErrorMessage(message);
      setStep(2); // Go back to OTP step
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const otpValue = otp.join('');

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
                  <h2 className="text-2xl font-semibold">Password Recovery</h2>
                </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="100">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-emerald-50 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  Recover your account with a polished 3-step flow
                </span>
                <h3 className="max-w-xl text-5xl font-semibold leading-tight">
                  Reset your password with a secure and modern experience.
                </h3>
                <p className="mt-6 max-w-lg text-lg leading-8 text-emerald-50/90">
                  Verify your email, confirm the code, and create a new password without losing the clean EcoCycle look.
                </p>
              </div>

              <div className="mt-10 space-y-5" data-aos="fade-up" data-aos-delay="180">
                {RESET_BENEFITS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-emerald-50/85">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8" data-aos="fade-up" data-aos-delay="260">
              <div>
                <div className="text-3xl font-semibold">3</div>
                <p className="mt-1 text-sm text-emerald-50/80">Steps</p>
              </div>
              <div>
                <div className="text-3xl font-semibold">6</div>
                <p className="mt-1 text-sm text-emerald-50/80">OTP digits</p>
              </div>
              <div>
                <div className="text-3xl font-semibold">Safe</div>
                <p className="mt-1 text-sm text-emerald-50/80">Recovery flow</p>
              </div>
            </div>
          </aside>

          <section className="relative bg-white px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-emerald-100/60 blur-3xl" />
            <div className="absolute bottom-10 left-6 h-24 w-24 rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-xl" data-aos="fade-up">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Reset access</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Forgot your password?</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Follow the guided steps below to recover your account securely.
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

              <div className="mb-8 grid gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-colors ${
                      s <= step ? 'bg-linear-to-r from-emerald-600 via-emerald-700 to-cyan-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
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

              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({});
                      }}
                      placeholder="you@example.com"
                      className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                      }`}
                    />
                    {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 via-emerald-700 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-700/25 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset code
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                    <p className="text-xs font-medium text-slate-600">Code sent to</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{email}</p>
                  </div>

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
                        Verify code
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        placeholder="••••••••"
                        className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                          errors.password
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      placeholder="••••••••"
                      className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 via-emerald-700 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-700/25 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset password
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
