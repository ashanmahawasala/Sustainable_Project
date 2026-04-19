import React from 'react';
import { Heart } from 'lucide-react';
import footerLogo from '../../assets/Logo01.png';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">

      {/* ================= TOP SECTION ================= */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x- gap-y-12 items-start">

          {/* ================= BRAND ================= */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <div className="mb-4">
              <img 
                src={footerLogo} 
                alt="EcoCycle Brand Logo" 
                className="w-[200px] md:w-[240px] h-auto object-contain"
              />
            </div>
            <p className="text-[15px] font-[300] text-slate-600 leading-relaxed max-w-md">
              The national public ledger for e-waste accountability. Promoting circular economies and driving action toward UN Sustainable Development Goal 12.
            </p>
          </div>

          {/* ================= NETWORK ================= */}
          <div className="flex flex-col items-end">
            <h3 className="text-sm font-bold  uppercase tracking-widest mb-5 text-[#0f3b7a]">
              Network
            </h3>
            <ul className="space-y-3.5 text-right">
              {["Open Data API", "Material Specs", "Annual Reports"].map(item => (
                <li key={item}>
                  <a href="#" className="text-[15px] font-[300] text-slate-600 hover:text-[#0f55a7] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= GOVERNANCE ================= */}
          <div className="flex flex-col items-end">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-5 text-[#0f3b7a]">
              Governance
            </h3>
            <ul className="space-y-3.5 text-right">
              {["Privacy Policy", "Terms of Use", "Security Portal"].map(item => (
                <li key={item}>
                  <a href="#" className="text-[15px] font-[300] text-slate-600 hover:text-[#0f55a7] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SUPPORT ================= */}
          <div className="flex flex-col items-end">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-5 text-[#0f3b7a]">
              Support
            </h3>
            <ul className="space-y-3.5 text-right">
              {["Admin Help", "Developer Docs", "Contact Us"].map(item => (
                <li key={item}>
                  <a href="#" className="text-[15px] font-[300] text-slate-600 hover:text-[#0f55a7] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="bg-gradient-to-r from-[#0f55a7] from-50% to-[#4db848]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-white text-[15px] font-[300] tracking-wide gap-4">
          
          {/* LEFT TEXT */}
          <p className="w-full sm:w-auto text-left">
            © {new Date().getFullYear()} EcoCycle Public Network. All historical data recalculated dynamically.
          </p>

          {/* RIGHT TEXT */}
          <p className="flex items-center w-full sm:w-auto justify-start sm:justify-end">
            Advancing global circularity Together
          </p>

        </div>
      </div>

    </footer>
  );
};

export default Footer;