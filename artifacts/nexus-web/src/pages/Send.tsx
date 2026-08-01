import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { api, type Account, type Bank } from "../lib/api";
import { AccountCard } from "../components/AccountCard";
import { formatBalance } from "../lib/utils";

type Step = "select-source" | "select-bank" | "enter-account" | "confirm-amount" | "success";

interface TransferState {
  sourceAccountId: number | null;
  recipientBankId: string | null;
  recipientBankName: string | null;
  recipientAccountNumber: string;
  recipientName: string | null;
  amount: string;
  note: string;
}

const STEP_TITLES: Record<Step, string> = {
  "select-source": "Select Account",
  "select-bank": "Select Bank",
  "enter-account": "Recipient",
  "confirm-amount": "Send Money",
  success: "Transfer Sent",
};

const BACK_STEP: Partial<Record<Step, Step>> = {
  "select-bank": "select-source",
  "enter-account": "select-bank",
  "confirm-amount": "enter-account",
};

const STEP_INDEX: Record<Step, number> = {
  "select-source": 0,
  "select-bank": 1,
  "enter-account": 2,
  "confirm-amount": 3,
  success: 4,
};

export default function Send() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select-source");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transfer, setTransfer] = useState<TransferState>({
    sourceAccountId: null, recipientBankId: null, recipientBankName: null,
    recipientAccountNumber: "", recipientName: null, amount: "", note: "",
  });
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [sending, setSending] = useState(false);
  const [successAmt, setSuccessAmt] = useState<number>(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<Account[]>("/accounts"),
      api.get<Bank[]>("/banks"),
    ]).then(([a, b]) => { setAccounts(a); setBanks(b); });
  }, []);

  const sourceAccount = accounts.find((a) => a.id === transfer.sourceAccountId);

  const reset = () => {
    setStep("select-source");
    setTransfer({ sourceAccountId: null, recipientBankId: null, recipientBankName: null, recipientAccountNumber: "", recipientName: null, amount: "", note: "" });
    setResolveError(""); setError(""); setSuccessAmt(0);
  };

  const handleResolve = async () => {
    if (transfer.recipientAccountNumber.length < 10) { setResolveError("Enter a valid 10-digit account number"); return; }
    setResolving(true); setResolveError("");
    try {
      const res = await api.post<{ accountName: string }>("/transfers/resolve", {
        bankId: transfer.recipientBankId, accountNumber: transfer.recipientAccountNumber,
      });
      setTransfer((t) => ({ ...t, recipientName: res.accountName }));
      setStep("confirm-amount");
    } catch { setResolveError("Could not resolve account. Please check the number."); }
    finally { setResolving(false); }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transfer.amount);
    if (isNaN(amount) || amount <= 0) { setError("Please enter a valid amount"); return; }
    if (amount > (sourceAccount?.balance ?? 0)) { setError("Insufficient funds"); return; }
    setSending(true); setError("");
    try {
      await api.post("/transfers", {
        sourceAccountId: transfer.sourceAccountId, recipientBank: transfer.recipientBankId,
        recipientAccountNumber: transfer.recipientAccountNumber, recipientName: transfer.recipientName,
        amount, note: transfer.note,
      });
      setSuccessAmt(amount);
      setStep("success");
    } catch (err) { setError(err instanceof Error ? err.message : "Transfer failed"); }
    finally { setSending(false); }
  };

  const canGoBack = step !== "select-source" && step !== "success";

  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        {canGoBack ? (
          <button
            onClick={() => setStep(BACK_STEP[step] ?? "select-source")}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors"
          >
            <ArrowLeft size={18} className="text-fg" />
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors"
          >
            <ArrowLeft size={18} className="text-fg" />
          </button>
        )}
        <h1 className="text-fg font-bold text-xl">{STEP_TITLES[step]}</h1>
        <span className="w-10" />
      </div>

      {/* Progress bar */}
      {step !== "success" && (
        <div className="flex gap-1.5 px-5 mb-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= STEP_INDEX[step] ? "bg-gold" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">

        {/* Step 1: Select account */}
        {step === "select-source" && (
          <div className="flex flex-col gap-4">
            <p className="text-muted text-sm">Which account to send from?</p>
            {!accounts.length ? (
              <div className="text-center py-12 text-muted text-sm">
                No accounts connected.{" "}
                <button onClick={() => navigate("/accounts/add")} className="text-gold font-semibold">
                  Add one
                </button>
              </div>
            ) : (
              accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  compact
                  selected={transfer.sourceAccountId === account.id}
                  onClick={() => {
                    setTransfer((t) => ({ ...t, sourceAccountId: account.id }));
                    setStep("select-bank");
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Step 2: Select bank */}
        {step === "select-bank" && (
          <div className="flex flex-col gap-4">
            <p className="text-muted text-sm">Select the recipient&apos;s bank</p>
            <div className="grid grid-cols-2 gap-3">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setTransfer((t) => ({ ...t, recipientBankId: bank.id, recipientBankName: bank.name }));
                    setStep("enter-account");
                  }}
                  className="flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-2xl hover:border-gold/40 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full"
                    style={{ backgroundColor: bank.color }}
                  />
                  <span className="text-fg text-sm font-semibold text-center leading-tight">
                    {bank.shortName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Account number */}
        {step === "enter-account" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    banks.find((b) => b.id === transfer.recipientBankId)?.color ?? "#888",
                }}
              />
              <span className="text-fg font-semibold text-sm">{transfer.recipientBankName}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-fg text-sm font-medium">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={transfer.recipientAccountNumber}
                onChange={(e) =>
                  setTransfer((t) => ({ ...t, recipientAccountNumber: e.target.value.slice(0, 10) }))
                }
                placeholder="0000000000"
                className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-xl font-mono tracking-widest"
              />
              {resolveError && (
                <p className="text-red text-xs">{resolveError}</p>
              )}
            </div>

            <button
              onClick={handleResolve}
              disabled={resolving}
              className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center mt-2"
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              {resolving ? <Loader2 size={20} className="animate-spin" /> : "Verify Account"}
            </button>
          </div>
        )}

        {/* Step 4: Amount */}
        {step === "confirm-amount" && (
          <div className="flex flex-col gap-4">
            {/* Recipient card */}
            <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-lg flex-shrink-0">
                {(transfer.recipientName ?? "?")[0]}
              </div>
              <div>
                <p className="text-fg font-bold text-sm">{transfer.recipientName}</p>
                <p className="text-muted text-xs">
                  {transfer.recipientBankName} · {transfer.recipientAccountNumber}
                </p>
              </div>
            </div>

            {/* From badge */}
            {sourceAccount && (
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-3">
                <span className="text-muted text-xs">From</span>
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: sourceAccount.bankColor }}
                />
                <span className="text-fg text-xs font-medium flex-1 truncate">
                  {sourceAccount.bankName} · Bal: ₦{formatBalance(sourceAccount.balance)}
                </span>
              </div>
            )}

            {/* Amount input */}
            <div className="flex items-center justify-center gap-2 py-6">
              <span className="text-muted text-4xl font-bold">₦</span>
              <input
                type="number"
                value={transfer.amount}
                onChange={(e) => setTransfer((t) => ({ ...t, amount: e.target.value }))}
                placeholder="0.00"
                className="text-fg text-5xl font-bold w-48 text-center bg-transparent focus:outline-none placeholder-border"
                style={{ minWidth: 0 }}
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-fg text-sm font-medium">Note (optional)</label>
              <input
                type="text"
                value={transfer.note}
                onChange={(e) => setTransfer((t) => ({ ...t, note: e.target.value }))}
                placeholder="What's this for?"
                className="h-12 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="bg-red/10 border border-red/20 rounded-xl px-4 py-3 text-red text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleTransfer}
              disabled={sending}
              className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center mt-2"
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                `Send ₦${transfer.amount ? parseFloat(transfer.amount).toLocaleString() : "0"}`
              )}
            </button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="flex flex-col items-center py-10 gap-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              <CheckCircle size={48} className="text-white" />
            </div>
            <h2 className="text-fg font-bold text-2xl">Transfer Successful!</h2>
            <p className="text-gold font-bold text-4xl">₦{formatBalance(successAmt)}</p>
            <p className="text-muted text-sm text-center">
              Sent to {transfer.recipientName} at {transfer.recipientBankName}
            </p>

            <button
              onClick={reset}
              className="w-full h-14 rounded-2xl font-semibold text-base text-white mt-6 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              Send Another
            </button>
            <button
              onClick={() => { reset(); navigate("/dashboard"); }}
              className="w-full h-12 rounded-2xl font-semibold text-base border border-border text-fg hover:border-gold/40 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
