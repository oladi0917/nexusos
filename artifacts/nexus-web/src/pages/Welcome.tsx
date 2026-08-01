import React from "react";
import { useNavigate } from "react-router-dom";
import { NexusLogo } from "../components/NexusLogo";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";

const FEATURES = [
  { icon: Shield, text: "Bank-grade security for your money" },
  { icon: Zap, text: "Instant transfers across all banks" },
  { icon: Globe, text: "All your accounts in one place" },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto">
      {/* Top section */}
      <div className="flex flex-col items-center gap-8 w-full mt-12">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4">
          <NexusLogo size="lg" />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-fg tracking-tight">Nexus</h1>
            <p className="text-muted text-base mt-1">Connected Finance. Simplified.</p>
          </div>
        </div>

        {/* Gold glow decoration */}
        <div
          className="w-48 h-48 rounded-full absolute opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* Feature list */}
        <div className="w-full flex flex-col gap-3 mt-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-4"
            >
              <div className="w-9 h-9 rounded-xl bg-gold-light flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-gold" />
              </div>
              <span className="text-fg text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="w-full flex flex-col gap-3 mt-10">
        <button
          onClick={() => navigate("/signup")}
          className="w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)", color: "#fff" }}
        >
          Get Started
          <ArrowRight size={18} />
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full h-14 rounded-2xl font-semibold text-base border border-border text-fg hover:border-gold/40 transition-colors"
        >
          Sign In
        </button>

        <p className="text-center text-muted text-xs mt-2">
          By continuing you agree to our{" "}
          <span className="text-gold cursor-pointer">Terms of Service</span> &amp;{" "}
          <span className="text-gold cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
