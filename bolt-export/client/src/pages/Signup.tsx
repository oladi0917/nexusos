import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NexusLogo } from "../components/NexusLogo";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col px-6 py-10 max-w-md mx-auto overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors flex-shrink-0"
      >
        <ArrowLeft size={18} className="text-fg" />
      </button>

      {/* Header */}
      <div className="flex flex-col gap-3 mt-10 mb-8">
        <NexusLogo size="sm" />
        <h1 className="text-3xl font-bold text-fg mt-2">Create account</h1>
        <p className="text-muted text-sm">Demo data seeded automatically on signup</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-fg text-sm font-medium">First name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="Emeka"
              className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-fg text-sm font-medium">Last name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="Okafor"
              className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Phone number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+234 801 234 5678"
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              className="h-14 px-4 pr-12 w-full rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red/10 border border-red/20 rounded-xl px-4 py-3 text-red text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-14 rounded-2xl font-semibold text-base text-white mt-2 transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-center text-muted text-sm mt-8 mb-4">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-gold font-semibold hover:underline"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
