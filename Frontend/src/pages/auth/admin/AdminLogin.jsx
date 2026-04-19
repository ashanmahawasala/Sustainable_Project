import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Loader,
  Shield,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import API from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const TRUST_POINTS = ['Admin session protection', 'Role-based access', 'Secure dashboard entry'];

const ADMIN_BENEFITS = [
  {
    title: 'Control operations',
    description: 'Manage users, requests, and platform activity with a focused admin interface.',
  },
  {
    title: 'Protected access',
    description: 'Use the same secure auth flow with automatic session handling.',
  },
  {
    title: 'Fast navigation',
    description: 'Jump into the admin dashboard with a polished, efficient sign-in experience.',
  },
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [accountLocked, setAccountLocked] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-cubic',
      offset: 80,
    });
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setAccountLocked(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/admin/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, user, message } = response.data;

      // Use context to store token and user data
      login(user, token);

      setSuccessMessage('Login successful! Redirecting to admin dashboard...');

      // Redirect to admin dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      const errorData = err.response?.data;
      
      // Check if account is locked
      if (errorData?.message?.includes('locked')) {
        setAccountLocked(true);
        setErrorMessage(
          errorData.message || 
          'Your account is temporarily locked. Please try again later or reset your password.'
        );
      } else if (errorData?.message?.includes('verify')) {
        setErrorMessage(
          'Please verify your email first. Redirecting to verification page...'
        );
        setTimeout(() => {
          localStorage.setItem('registeredEmail', formData.email);
          navigate('/admin/verify-email');
        }, 2000);
      } else {
        setErrorMessage(
          errorData?.message || 'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_26%),linear-gradient(135deg,#020617_0%,#052e2b_48%,#082f49_100%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-4xl border border-white/10 bg-white/95 shadow-[0_30px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900 p-12 text-white lg:flex">
            <div className="absolute -left-16 top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-6 right-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3" data-aos="fade-down">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-md">
                  <div className="h-7 w-7 rounded-xl bg-linear-to-br from-cyan-200 to-emerald-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">EcoCycle</p>
                  <h2 className="text-2xl font-semibold">Admin Portal</h2>
                </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="100">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-cyan-50 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  Secure access for platform administrators
                </span>
                <h3 className="max-w-xl text-5xl font-semibold leading-tight">
                  A focused, premium workspace for managing the EcoCycle platform.
                </h3>
                <p className="mt-6 max-w-lg text-lg leading-8 text-cyan-50/90">
                  Sign in to oversee users, requests, and system activity with a cleaner and more confident flow.
                </p>
              </div>

              <div className="mt-10 space-y-5" data-aos="fade-up" data-aos-delay="180">
                {ADMIN_BENEFITS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-cyan-50/85">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8" data-aos="fade-up" data-aos-delay="260">
              <div>
                <div className="text-3xl font-semibold">24/7</div>
                <p className="mt-1 text-sm text-cyan-50/80">Monitoring</p>
              </div>
              <div>
                <div className="text-3xl font-semibold">RBAC</div>
                <p className="mt-1 text-sm text-cyan-50/80">Roles</p>
              </div>
              <div>
                <div className="text-3xl font-semibold">Secure</div>
                <p className="mt-1 text-sm text-cyan-50/80">Session flow</p>
              </div>
            </div>
          </aside>

          <section className="relative bg-white px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-emerald-100/60 blur-3xl" />
            <div className="absolute bottom-10 left-6 h-24 w-24 rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-xl" data-aos="fade-up">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Admin login</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Sign in to the portal</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Access the admin dashboard using your verified administrator account.
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700 shadow-sm sm:flex">
                  <Shield className="h-6 w-6" />
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

              {successMessage && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className={`mb-6 rounded-2xl border p-4 shadow-sm ${accountLocked ? 'border-orange-200 bg-orange-50/90' : 'border-red-200 bg-red-50/90'}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`mt-0.5 h-5 w-5 ${accountLocked ? 'text-orange-500' : 'text-red-500'}`} />
                    <p className={`text-sm font-medium ${accountLocked ? 'text-orange-800' : 'text-red-800'}`}>
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                      errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                    }`}
                  />
                  {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-900">Password</label>
                    <Link
                      to="/admin/forgot-password"
                      className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                        errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
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

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 cursor-pointer text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">Admin-only secure session</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-700/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-700/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-emerald-100 p-2 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Need an admin account?</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Create a verified admin profile and use the same secure access flow.
                    </p>
                    <Link
                      to="/admin/register"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                    >
                      Admin registration
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
