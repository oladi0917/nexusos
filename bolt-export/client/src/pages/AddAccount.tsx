import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, type Bank } from "../lib/api";

export default function AddAccount() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [form, setForm] = useState({
    bankId: "",
    accountNumber: "",
    accountName: "",
    balance: "",
    accountType: "checking",
    accountSubtype: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Bank[]>("/banks").then(setBanks);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.bankId || !form.accountNumber || !form.accountName || !form.balance) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/accounts", {
        bankId: form.bankId,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        balance: parseFloat(form.balance),
        accountType: form.accountType,
        accountSubtype: form.accountSubtype || null,
      });
      navigate("/accounts", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col px-5 py-10 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors"
        >
          <ArrowLeft size={18} className="text-fg" />
        </button>
        <h1 className="text-fg font-bold text-xl">Add Account</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Bank select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Bank</label>
          <select
            value={form.bankId}
            onChange={(e) => setForm((f) => ({ ...f, bankId: e.target.value }))}
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg focus:outline-none focus:border-gold transition-colors text-sm appearance-none"
          >
            <option value="">Select a bank</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Account Type</label>
          <select
            value={form.accountType}
            onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg focus:outline-none focus:border-gold transition-colors text-sm appearance-none"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Card</option>
            <option value="loan">Loan</option>
            <option value="investment">Investment</option>
          </select>
        </div>

        {/* Account subtype */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Account Subtype (optional)</label>
          <input
            type="text"
            value={form.accountSubtype}
            onChange={(e) => setForm((f) => ({ ...f, accountSubtype: e.target.value }))}
            placeholder="e.g., High Yield, Visa Gold"
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
          />
        </div>

        {/* Account number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Account Number</label>
          <input
            type="text"
            value={form.accountNumber}
            onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
            placeholder="0123456789"
            maxLength={10}
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm font-mono tracking-widest"
          />
        </div>

        {/* Account name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Account Name</label>
          <input
            type="text"
            value={form.accountName}
            onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
            placeholder="Emeka Okafor"
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
          />
        </div>

        {/* Balance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fg text-sm font-medium">Current Balance (₦)</label>
          <input
            type="number"
            value={form.balance}
            onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
          />
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
            "Connect Account"
          )}
        </button>
      </form>
    </div>
  );
}
