import React, { useEffect, useState } from 'react';

export const Spinner = ({ small = false }) => {
  return (
    <span
      aria-label="Loading"
      className={`inline-block rounded-full animate-spin ${
        small ? 'h-4 w-4' : 'h-10 w-10'
      }`}
      style={{
        backgroundImage:
          'conic-gradient(from 90deg, #0284c7, #10b981, transparent 70%)',
        WebkitMask: small
          ? 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0)'
          : 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
        mask: small
          ? 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0)'
          : 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
      }}
    />
  );
};

export const SummaryCard = ({ title, value, subtitle, tone = 'text-slate-900' }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">
        {title}
      </p>
      <div className={`text-3xl md:text-4xl font-black ${tone}`}>{value}</div>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
  );
};

export const SectionPanel = ({ left, right }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 flex flex-col md:flex-row relative z-10 min-h-[450px]">
      <div className="p-8 md:p-12 md:w-1/3 flex flex-col justify-center bg-white">
        {left}
      </div>
      <div className="md:w-2/3 p-8 bg-slate-50 border-l border-slate-100">
        {right}
      </div>
    </div>
  );
};

export const PageShell = ({
  banner,
  bannerAlt = 'Page banner',
  footerBanner,
  footerBannerAlt = 'Page footer banner',
  loading = false,
  children,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 40);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {banner ? (
        <div className="w-full">
          <img src={banner} alt={bannerAlt} className="block w-full h-auto" />
        </div>
      ) : null}

      <div
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0px)' : 'translateY(14px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Spinner />
          </div>
        ) : (
          children
        )}
      </div>

      {footerBanner ? (
        <div className="w-full mt-10">
          <img
            src={footerBanner}
            alt={footerBannerAlt}
            className="block w-full h-auto"
          />
        </div>
      ) : null}
    </div>
  );
};