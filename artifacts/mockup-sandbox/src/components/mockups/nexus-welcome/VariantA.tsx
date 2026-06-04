import React from 'react';

export default function VariantA() {
  return (
    <div className="w-[450px] h-[910px] bg-[#0C0C0C] text-white overflow-hidden relative font-sans flex flex-col">
      {/* Background glow */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#C9A84C] opacity-20 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="flex-1 px-6 pt-16 flex flex-col items-center z-10">
        
        {/* Logo Mark */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-xl border border-[#C9A84C]/30 opacity-50 blur-[2px]" />
          <div className="absolute -inset-1 rounded-lg border border-[#C9A84C]/40" />
          <div className="w-12 h-12 bg-[#C9A84C] rounded-lg flex items-center justify-center relative shadow-[0_0_15px_rgba(201,168,76,0.5)]">
            <span className="text-[#0C0C0C] font-bold text-2xl tracking-tighter">N</span>
          </div>
        </div>

        {/* Branding */}
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2 text-white">NEXUS</h1>
        <p className="text-[#C9A84C] text-[10px] font-bold tracking-[0.3em] uppercase mb-10">
          Connected Finance. Simplified.
        </p>

        {/* Balance Card with texture */}
        <div className="w-full relative rounded-2xl overflow-hidden mb-8 shadow-[0_10px_40px_rgba(201,168,76,0.15)]">
          {/* Card Base */}
          <div className="absolute inset-0 bg-[#C9A84C]" />
          
          {/* Subtle dot grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
              backgroundSize: '8px 8px'
            }}
          />
          
          <div className="relative p-6 text-[#0C0C0C] flex flex-col items-center">
            <span className="text-sm font-medium opacity-80 mb-1">Total Balance</span>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-4xl font-bold tracking-tight">₦332,500</span>
              <span className="text-xl font-bold opacity-80 pb-1">.50</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold bg-white/20 px-4 py-2 rounded-full">
              <span>3 ACCOUNTS</span>
              <div className="w-1 h-1 bg-[#0C0C0C] rounded-full opacity-50" />
              <span>NGN</span>
            </div>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex w-full justify-between gap-3">
          {[
            { label: 'Spent', value: '₦42.5k' },
            { label: 'Earned', value: '₦128k' },
            { label: 'Saved', value: '₦12k' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1">
              <span className="text-[#888888] text-[11px] uppercase tracking-wider font-medium">{stat.label}</span>
              <span className="text-[#C9A84C] text-sm font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Sheet */}
      <div className="relative bg-[#121212] rounded-t-3xl border-t border-[#C9A84C]/30 px-6 py-10 z-20">
        <h2 className="text-[22px] font-bold text-white text-center mb-3 tracking-tight">
          Take control of your money
        </h2>
        <p className="text-[#888888] text-sm text-center mb-8 px-4 leading-relaxed">
          The premium financial companion designed for modern Nigerians. Manage multiple accounts in one place.
        </p>

        <div className="flex flex-col gap-3">
          <button className="w-full relative overflow-hidden rounded-xl bg-[#C9A84C] text-[#0C0C0C] font-semibold text-base py-4 shadow-[0_4px_20px_rgba(201,168,76,0.3)]">
            {/* Glossy top-edge highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
            <span className="relative z-10">Get Started</span>
          </button>
          
          <button className="w-full rounded-xl bg-transparent border border-white/10 text-white font-medium text-base py-4 hover:bg-white/5 transition-colors">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
