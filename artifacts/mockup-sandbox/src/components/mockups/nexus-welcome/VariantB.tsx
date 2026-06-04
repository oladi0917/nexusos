import React from "react";
import { ArrowRight, Hexagon, Shield, Zap } from "lucide-react";

export default function VariantB() {
  return (
    <div
      className="flex flex-col items-center justify-between w-full mx-auto overflow-hidden font-sans bg-[#0C0C0C] text-white"
      style={{ width: 450, height: 910 }}
    >
      {/* Top Section - Hero */}
      <div className="flex flex-col items-center justify-center w-full px-6 pt-24 pb-8 flex-1">
        {/* Logo and Wordmark */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center justify-center w-12 h-12 mb-6 border border-[#C9A84C]/30 rounded-full">
            <Hexagon className="w-6 h-6 text-[#C9A84C]" fill="currentColor" strokeWidth={1} />
          </div>
          <h1
            className="text-[52px] font-bold text-white uppercase leading-none tracking-[0.5em] ml-[0.5em]"
          >
            NEXUS
          </h1>
          <p className="mt-4 text-xs font-light tracking-[0.2em] text-[#888888] uppercase">
            Connected Finance. Simplified.
          </p>
        </div>

        {/* Balance Card - Minimal */}
        <div className="w-full bg-[#141414] border border-[#C9A84C]/50 rounded-none p-8 mb-10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#888888] tracking-widest uppercase">Total Balance</span>
            <span className="text-xs text-[#C9A84C] font-mono border border-[#C9A84C]/30 px-2 py-1">NGN</span>
          </div>
          <div className="text-[44px] font-light tracking-tight text-white mb-6">
            ₦332,500<span className="text-[#888888]">.50</span>
          </div>
          <div className="w-full h-px bg-[#C9A84C]/30 mb-6" />
          <div className="flex items-center text-sm text-[#888888]">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] mr-3" />
            3 Active Accounts
          </div>
        </div>

        {/* Stats - Horizontal Line Items */}
        <div className="w-full">
          <div className="w-full h-px bg-[#333333] mb-4" />
          <div className="flex items-center justify-between px-2 text-[11px] tracking-wider uppercase text-[#888888]">
            <div className="flex items-center">
              <span className="text-white font-medium mr-1.5">8+</span> Accounts
            </div>
            <div className="w-px h-3 bg-[#333333]" />
            <div className="flex items-center">
              <span className="text-white font-medium mr-1.5">Instant</span> Transfers
            </div>
            <div className="w-px h-3 bg-[#333333]" />
            <div className="flex items-center">
              <span className="text-white font-medium mr-1.5">256-bit</span> Security
            </div>
          </div>
          <div className="w-full h-px bg-[#333333] mt-4" />
        </div>
      </div>

      {/* Bottom Sheet - CTA */}
      <div className="w-full bg-[#1A1A1A] p-8 pb-12 pt-10 flex flex-col items-center text-center mt-auto">
        <h2 className="text-[18px] font-medium text-white mb-4">
          Welcome to the new standard.
        </h2>
        <p className="text-[#888888] text-sm leading-relaxed mb-10 px-4">
          Experience seamless global transfers, intelligent wealth management, and uncompromised security in one unified platform.
        </p>
        
        <div className="w-full flex flex-col gap-4">
          <button className="w-full bg-[#C9A84C] text-[#0C0C0C] font-medium py-4 text-sm uppercase tracking-widest transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
            Create Account
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button className="w-full bg-transparent text-[#C9A84C] font-medium py-4 text-sm uppercase tracking-widest transition-opacity hover:opacity-80">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
