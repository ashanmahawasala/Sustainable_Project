import React, { useState, useEffect } from 'react';
import {
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Target,
  Leaf,
} from 'lucide-react';
import { getSettings, updateSettings } from '../../services/api';

import { PageShell } from '../../shared/PageShell';

const ImpactSettings = () => {
  const [formData, setFormData] = useState({
    co2FactorPerKg: '',
    monthlyTargetKg: '',
  });
  const [errors, setErrors] = useState({
    co2FactorPerKg: '',
    monthlyTargetKg: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        setFormData({
          co2FactorPerKg: response.data.co2FactorPerKg,
          monthlyTargetKg: response.data.monthlyTargetKg,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const validateField = (name, value) => {
    const raw = String(value ?? '').trim();

    if (!raw) {
      return 'This field is required.';
    }

    const numericValue = Number(raw);

    if (Number.isNaN(numericValue)) {
      return 'Please enter a valid number.';
    }

    if (numericValue < 0) {
      return 'Value cannot be negative.';
    }

    if (name === 'co2FactorPerKg' && numericValue === 0) {
      return 'CO₂ factor must be greater than 0.';
    }

    if (name === 'monthlyTargetKg' && numericValue < 1) {
      return 'Monthly target must be at least 1 kg.';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {
      co2FactorPerKg: validateField('co2FactorPerKg', formData.co2FactorPerKg),
      monthlyTargetKg: validateField('monthlyTargetKg', formData.monthlyTargetKg),
    };

    setErrors(newErrors);

    return !newErrors.co2FactorPerKg && !newErrors.monthlyTargetKg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      setMessage({
        type: 'error',
        text: 'Please correct the highlighted fields before saving.',
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await updateSettings({
        co2FactorPerKg: Number(formData.co2FactorPerKg),
        monthlyTargetKg: Number(formData.monthlyTargetKg),
      });

      setMessage({
        type: 'success',
        text: 'Configuration updated successfully.',
      });

      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Failed to save configuration.',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputFields = [
    {
      id: 'co2FactorPerKg',
      label: 'CO₂ Equivalency Factor',
      description: 'Defines how many kilograms of CO₂ are averted per 1 kg of processed e-waste.',
      icon: Leaf,
      unit: 'kg CO₂ / kg',
      step: '0.1',
      min: '0',
      tone: 'text-[#0f55a7]',
      cardValue: `${formData.co2FactorPerKg || '—'}`,
      cardUnit: 'kg CO₂ / kg',
    },
    {
      id: 'monthlyTargetKg',
      label: 'Monthly Target',
      description: 'Sets the monthly collection target used across dashboard progress tracking.',
      icon: Target,
      unit: 'kg',
      step: '1',
      min: '0',
      tone: 'text-[#2a9322]',
      cardValue: `${formData.monthlyTargetKg || '—'}`,
      cardUnit: 'kg',
    },
  ];

  return (
    <PageShell loading={loading}>
      <div className="text-center mb-10">
        <p className="text-[#0f55a7] font-semibold text-sm mb-2 uppercase tracking-widest">
          EcoCycle Admin Portal
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Configuration
        </h2>
        <p className="mt-3 text-slate-600 max-w-3xl mx-auto leading-7">
          Manage the platform-wide calculation settings used in impact analytics,
          environmental reporting, and monthly performance tracking.
        </p>
      </div>

      {message && (
        <div className="max-w-5xl mx-auto mb-8">
          <div
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-semibold">{message.text}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.2fr]">
          <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 bg-white">
            <div className="inline-flex items-center rounded-full bg-[#0f55a7]/5 text-[#0f55a7] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
              System Controls
            </div>

            <h3 className="mt-5 text-3xl font-bold text-slate-950">
              <span className="text-[#1055a7]">Configure analytics</span>{' '}
              <span className="text-[#2a9322]">fundamentals</span>
            </h3>

            <p className="mt-4 text-slate-600 leading-8 max-w-xl">
              These values directly affect CO₂ calculations, dashboard summaries,
              and monthly progress indicators. Use stable, approved numbers to
              maintain reporting consistency across the platform.
            </p>

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Admin Authorization Required
                  </p>
                  <p className="text-sm text-slate-500 mt-1 leading-6">
                    Changes made here affect system-wide analytics and historical
                    recalculation behavior.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {inputFields.map((field) => {
                const Icon = field.icon;

                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          {field.label}
                        </p>
                        <p className={`mt-2 text-3xl font-black ${field.tone}`}>
                          {field.cardValue}
                          <span className="ml-1 text-base font-semibold text-slate-400">
                            {field.cardUnit}
                          </span>
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 md:p-10 bg-slate-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <SlidersHorizontal className="w-5 h-5 text-[#0f55a7]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Update Settings
                </p>
                <h3 className="text-xl font-bold text-slate-950">
                  Administrative Parameters
                </h3>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8"
              noValidate
            >
              <div className="space-y-8">
                {inputFields.map((field) => {
                  const Icon = field.icon;
                  const hasError = Boolean(errors[field.id]);

                  return (
                    <div key={field.id} className="grid md:grid-cols-[1fr_1.1fr] gap-5 items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <label
                            htmlFor={field.id}
                            className="text-sm font-bold text-slate-900"
                          >
                            {field.label}
                          </label>
                        </div>
                        <p className="text-sm text-slate-500 leading-7">
                          {field.description}
                        </p>
                      </div>

                      <div>
                        <div className="relative">
                          <input
                            id={field.id}
                            type="number"
                            step={field.step}
                            min={field.min}
                            required
                            name={field.id}
                            value={formData[field.id]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl bg-slate-50 px-4 pr-28 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                              hasError
                                ? 'border border-red-300 focus:border-red-400 focus:ring-red-100'
                                : 'border border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                            }`}
                          />
                          <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 whitespace-nowrap">
                            {field.unit}
                          </span>
                        </div>
                        {hasError && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors[field.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-slate-500 leading-6">
                  Saved changes apply immediately to analytics calculations.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0f55a7] hover:bg-[#0c478d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  {saving ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="inline-block h-4 w-4 rounded-full from-sky-600 to-emerald-500 animate-spin"
                        style={{
                          backgroundImage:
                            'conic-gradient(from 90deg, var(--tw-gradient-from), var(--tw-gradient-to), transparent 70%)',
                          WebkitMask:
                            'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0)',
                          mask:
                            'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0)',
                        }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Configuration
                      <Save className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ImpactSettings;