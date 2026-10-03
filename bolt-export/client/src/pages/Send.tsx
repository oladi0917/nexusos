import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { api, type Account, type Bank } from "../lib/api";
import { AccountCard } from "../components/AccountCard";
import { formatBalance } from "../lib/utils";

type Step =
  | "select-sources"
  | "select-bank"
  | "enter-account"
  | "enter-amount"
  | "allocate-amount"
  | "confirm"
  | "processing"
  | "success"
  | "error";

interface TransferState {
  sourceAllocations: { accountId: number; amount: number }[]; // selected accounts with allocated amounts
  recipientBankId: string | null;
  recipientBankName: string | null;
  recipientAccountNumber: string;
  recipientName: string | null;
  note: string;
}

const STEP_TITLES: Record<Step, string> = {
  "select-sources": "Select Accounts",
  "select-bank": "Select Bank",
  "enter-account": "Recipient",
  "enter-amount": "Enter Amount",
  "allocate-amount": "Allocate Amount",
  "confirm": "Review",
  "processing": "Processing",
  "success": "Transfer Sent",
  "error": "Transfer Failed",
};

const BACK_STEP: Partial<Record<Step, Step>> = {
  "select-bank": "select-sources",
  "enter-account": "select-bank",
  "enter-amount": "enter-account",
  "allocate-amount": "enter-amount",
  "confirm": "allocate-amount",
  "processing": "confirm",
  "success": "select-sources", // after success, allow new transfer
  "error": "allocate-amount", // on error, go back to allocation to fix
};

const STEP_INDEX: Record<Step, number> = {
  "select-sources": 0,
  "select-bank": 1,
  "enter-account": 2,
  "enter-amount": 3,
  "allocate-amount": 4,
  "confirm": 5,
  "processing": 6,
  "success": 7,
  "error": 8,
};

export default function Send() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select-sources");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transfer, setTransfer] = useState<TransferState>({
    sourceAllocations: [],
    recipientBankId: null,
    recipientBankName: null,
    recipientAccountNumber: "",
    recipientName: null,
    note: "",
  });
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successAmt, setSuccessAmt] = useState<number>(0);
  const [allocations, setAllocations] = useState<Record<number, string>>({}); // temporary allocation amounts as strings

  // Fetch accounts and banks on mount
  useEffect(() => {
    Promise.all([
      api.get<Account[]>("/accounts"),
      api.get<Bank[]>("/banks"),
    ]).then(([a, b]) => { setAccounts(a); setBanks(b); });
  }, []);

  // Get selected account IDs
  const selectedAccountIds = transfer.sourceAllocations.map((sa) => sa.accountId);
  const selectedAccounts = accounts.filter((acc) =>
    selectedAccountIds.includes(acc.id)
  );

  // Total allocated amount
  const totalAllocated = transfer.sourceAllocations.reduce(
    (sum, sa) => sum + sa.amount,
    0
  );

  // Amount entered in enter-amount step
  const enteredAmount = parseFloat(transfer.amount) || 0;

  // Reset function
  const reset = () => {
    setStep("select-sources");
    setTransfer({
      sourceAllocations: [],
      recipientBankId: null,
      recipientBankName: null,
      recipientAccountNumber: "",
      recipientName: null,
      note: "",
    });
    setAllocations({});
    setResolveError("");
    setError("");
    setSuccessAmt(0);
  };

  // Handle bank resolution (same as before)
  const handleResolve = async () => {
    if (transfer.recipientAccountNumber.length < 10) {
      setResolveError("Enter a valid 10-digit account number");
      return;
    }
    setResolving(true);
    setResolveError("");
    try {
      const res = await api.post<{ accountName: string }>(
        "/transfers/resolve",
        {
          bankId: transfer.recipientBankId,
          accountNumber: transfer.recipientAccountNumber,
        }
      );
      setTransfer((t) => ({
        ...t,
        recipientName: res.accountName,
      }));
      setStep("enter-amount");
    } catch {
      setResolveError("Could not resolve account. Please check the number.");
    } finally {
      setResolving(false);
    }
  };

  // Handle amount entry (move to allocation)
  const handleAmountEnter = () => {
    const amount = parseFloat(transfer.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    // Store the total amount to allocate
    // We'll keep it in transfer.amount as string for now, but we need to use it in allocation step
    // We'll transfer the entered amount to a separate state? Let's keep in transfer.amount and use it in allocation step.
    // We'll set a flag that we have entered amount.
    setStep("allocate-amount");
  };

  // Handle allocation submission (move to confirm)
  const handleAllocate = () => {
    // Validate that allocations sum to entered amount
    const sum = Object.values(allocations).reduce(
      (total, val) => total + parseFloat(val || "0"),
      0
    );
    const amount = parseFloat(transfer.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter an amount first");
      return;
    }
    if (Math.abs(sum - amount) > 0.01) {
      setError(`Allocations must sum to ₦${formatBalance(amount)}`);
      return;
    }
    // Build sourceAllocations array from allocations map
    const sourceAllocations: { accountId: number; amount: number }[] = [];
    for (const [idStr, amountStr] of Object.entries(allocations)) {
      const id = parseInt(idStr);
      const amt = parseFloat(amountStr);
      if (!isNaN(id) && !isNaN(amt)) {
        sourceAllocations.push({ accountId: id, amount: amt });
      }
    }
    setTransfer((t) => ({
      ...t,
      sourceAllocations,
    }));
    setStep("confirm");
  };

  // Handle confirmation (move to processing)
  const handleConfirm = () => {
    setStep("processing");
    // We'll trigger the actual transfer in a useEffect or via a promise
    // We'll do it in a useEffect that watches step
  };

  // Handle transfer submission (processing step)
  useEffect(() => {
    if (step === "processing") {
      const handleTransfer = async () => {
        setProcessing(true);
        setError("");
        try {
          // Prepare payload for backend
          const payload = {
            sourceAccountIds: transfer.sourceAllocations.map(
              (sa) => sa.accountId
            ),
            amounts: transfer.sourceAllocations.map(
              (sa) => sa.amount
            ),
            recipientBankId: transfer.recipientBankId,
            recipientAccountNumber: transfer.recipientAccountNumber,
            recipientName: transfer.recipientName,
            note: transfer.note,
          };
          await api.post("/transfers", payload);
          // Assume backend returns success with transaction and updated balances
          // For now, we'll simulate success
          setSuccessAmt(
            transfer.sourceAllocations.reduce(
              (sum, sa) => sum + sa.amount,
              0
            )
          );
          setStep("success");
        } catch (err: any) {
          setError(
            err.response?.data?.error ||
              err.message ||
              "Transfer failed"
          );
          setStep("error");
        } finally {
          setProcessing(false);
        }
      };
      handleTransfer();
    }
  }, [step]);

  // Handle go back
  const handleGoBack = () => {
    const back = BACK_STEP[step];
    if (back) {
      setStep(back);
    } else {
      navigate(-1);
    }
  };

  // Render step content
  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        {step !== "success" && step !== "error" ? (
          <button
            onClick={handleGoBack}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors
          >
            <ArrowLeft size={18} className="text-fg" />
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors
          >
            <ArrowLeft size={18} className="text-fg" />
          </button>
        )}
        <h1 className="text-fg font-bold text-xl">{STEP_TITLES[step]}</h1>
        <span className="w-10" />
      </div>

      {/* Progress bar */}
      {[
        "select-sources",
        "select-bank",
        "enter-account",
        "enter-amount",
        "allocate-amount",
        "confirm",
        "processing",
      ].includes(step) && (
        <div className="flex gap-1.5 px-5 mb-5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
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
        {/* Step 1: Select Accounts */}
        {step === "select-sources" && (
          <div className="flex flex-col gap-4>
            <p className="text-muted text-sm>
              Select accounts to fund this payment:
            </p>
            {!accounts.length ? (
              <div className="text-center py-12 text-muted text-sm>
                No accounts connected.{" "}
                <button
                  onClick={() => navigate("/accounts/add")}
                  className="text-gold font-semibold
                >
                  Add one
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2>
                {accounts.map((account) => {
                  const isSelected =
                    selectedAccountIds.includes(account.id);
                  return (
                    <div
                      key={account.id}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer
                      onClick={() => {
                        // Toggle selection
                        const newAllocations = { ...allocations };
                        if (isSelected) {
                          delete newAllocations[account.id];
                        } else {
                          // Initialize with empty string; user will enter amount later
                          newAllocations[account.id] = "";
                        }
                        setAllocations(newAllocations);
                      }}
                    >
                      <AccountCard
                        account={account}
                        compact
                        selected={isSelected}
                      </AccountCard>
                    </div>
                  );
                })}
                {/* Show selected count */}
                <p className="text-muted text-sm mt-2>
                  {selectedAccountIds.length} account(s) selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Bank */}
        {step === "select-bank" && (
          <div className="flex flex-col gap-4>
            <p className="text-muted text-sm>Select the recipient's bank</p>
            <div className="grid grid-cols-2 gap-3>
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setTransfer((t) => ({
                      ...t,
                      recipientBankId: bank.id,
                      recipientBankName: bank.name,
                    }));
                    setStep("enter-account");
                  }}
                  className="flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-2xl hover:border-gold/40 transition-colors
                >
                  <div
                    className="w-9 h-9 rounded-full"
                    style={{ backgroundColor: bank.color }}
                  />
                  <span className="text-fg text-sm font-semibold text-center leading-tight>
                    {bank.shortName}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Enter Account Number */}
        {step === "enter-account" && (
          <div className="flex flex-col gap-4>
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4>
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    banks.find((b) => b.id === transfer.recipientBankId)
                      ?.color ?? "#888",
                }}
              />
              <span className="text-fg font-semibold text-sm>
                {transfer.recipientBankName}
              </span>
            </div>

            <div className="flex flex-col gap-1.5>
              <label className="text-fg text-sm font-medium>Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={transfer.recipientAccountNumber}
                onChange={(e) =>
                  setTransfer((t) => ({
                    ...t,
                    recipientAccountNumber: e.target.value.slice(0, 10),
                  ))
                }
                placeholder="0000000000
                className="h-14 px-4 rounded-xl bg-card border border-border text-fg placeholder-muted focus:outline-none focus:border-gold transition-colors text-xl font-mono tracking-widest
              />
              {resolveError && (
                <p className="text-red text-xs>{resolveError}</p>
              )}
            </div>

            <button
              onClick={handleResolve}
              disabled={resolving}
              className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center mt-2
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              {resolving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Verify Account"
              )}
            </button>
          </div>
        )}

        {/* Step 4: Enter Amount */}
        {step === "enter-amount" && (
          <div className="flex flex-col gap-4>
            <p className="text-muted text-sm>
              Enter the total amount to send:
            </p>
            <div className="flex items-center gap-2 py-6>
              <span className="text-muted text-4xl font-bold>₦</span>
              <input
                type="number"
                value={transfer.amount}
                onChange={(e) =>
                  setTransfer((t) => ({
                    ...t,
                    amount: e.target.value,
                  }))
                }
                placeholder="0.00
                className="text-fg text-5xl font-bold w-48 text-center bg-transparent focus:outline-none placeholder-border
                style={{ minWidth: 0 }}
              />
            </div>
            <button
              onClick={handleAmountEnter}
              disabled={!transfer.amount || parseFloat(transfer.amount) <= 0}
              className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center mt-2
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 5: Allocate Amount */}
        {step === "allocate-amount" && (
          <div className="flex flex-col gap-4>
            <p className="text-muted text-sm>
              Allocate the total amount among selected accounts:
            </p>
            <p className="text-muted text-sm>
              Total to allocate: ₦{formatBalance(enteredAmount)}
            </p>
            <div className="flex flex-col gap-3>
              {selectedAccounts.map((account) => {
                const allocated = allocations[account.id] ?? "";
                return (
                  <div
                    key={account.id}
                    className="flex flex-col gap-2 p-3 bg-card border border-border rounded-xl
                  >
                    <div className="flex items-center gap-2>
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: account.bankColor }}
                      />
                      <span className="text-fg text-sm font-medium>
                        {account.bankName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2>
                      <label className="text-fg text-sm>Allocate (₦)</label>
                      <input
                        type="number"
                        value={allocated}
                        onChange={(e) => {
                          setAllocations((prev) => ({
                            ...prev,
                            [account.id]: e.target.value,
                          }));
                        }}
                        placeholder="0"
                        className="w-32 h-12 px-2 rounded-xl bg-card border border-border text-fg focus:outline-none focus:border-gold transition-colors
                      />
                    </div>
                    <p className="text-muted text-sm>
                      Remaining: ₦{formatBalance(
                        enteredAmount -
                          (parseFloat(allocated) || 0) -
                          // subtract allocations of other accounts? We'll compute remaining dynamically.
                          // We'll compute remaining in a separate variable below.
                          0
                      )}
                    </p>
                  </div>
                );}}
              {/* Show remaining amount */}
              <div className="flex items-center gap-2 pt-4>
                <span className="text-fg font-semibold>Remaining:</span>
                <span className="text-fg font-semibold>
                  ₦{formatBalance(
                    enteredAmount -
                      Object.values(allocations).reduce(
                        (sum, val) => sum + (parseFloat(val) || 0),
                        0
                      )
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-between pt-4>
              <button
                onClick={() => {
                  // Clear all allocations
                  setAllocations({});
                }}
                className="text-sm text-muted hover:text-gold
              >
                Clear All
              </button>
              <button
                onClick={handleAllocate}
                disabled={
                  Object.keys(allocations).length !== selectedAccounts.length ||
                  Object.values(allocations).some(
                    (val) => val === "" || isNaN(parseFloat(val))
                  ) ||
                  Math.abs(
                    Object.values(allocations).reduce(
                      (sum, val) => sum + (parseFloat(val) || 0),
                      0
                    ) - enteredAmount
                  ) > 0.01
                }
                className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center
                style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confirm */}
        {step === "confirm" && (
          <div className="flex flex-col gap-4>
            {/* Summary */}
            <div className="flex flex-col gap-3>
              <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4>
                <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-lg flex-shrink-0>
                  {(transfer.recipientName ?? "?")[0]}
                </div>
                <div>
                  <p className="text-fg font-bold text-sm>{transfer.recipientName}</p>
                  <p className="text-muted text-xs>
                    {transfer.recipientBankName} · {transfer.recipientAccountNumber}
                  </p>
                </div>
              </div>

              {/* Funding sources */}
              <div className="flex flex-col gap-2>
                <p className="text-fg font-semibold text-sm>Funding Sources</p>
                {transfer.sourceAllocations.map((sa) => {
                  const account = accounts.find((a) => a.id === sa.accountId);
                  return (
                    <div
                      key={sa.accountId}
                      className="flex items-center gap-2 p-2 bg-secondary rounded-xl
                    >
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: account?.bankColor ?? "#888" }}
                      />
                      <div className="flex flex-col gap-1>
                        <span className="text-fg text-sm>
                          {account?.bankName ?? "Unknown"}
                        </span>
                        <span className="text-muted text-xs>
                          ₦{formatBalance(sa.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 pt-2 pb-1>
                  <span className="text-fg font-semibold>Total:</span>
                  <span className="text-fg font-semibold>
                    ₦{formatBalance(
                      transfer.sourceAllocations.reduce(
                        (sum, sa) => sum + sa.amount,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              {/* Note */}
              {transfer.note && (
                <div className="flex flex-col gap-2>
                  <p className="text-fg font-semibold text-sm>Note</p>
                  <p className="text-muted text-sm>{transfer.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4>
              <button
                onClick={() => setStep("allocate-amount")}
                className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center
                style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
              >
                Edit Allocation
              </button>
              <button
                onClick={handleConfirm}
                className="h-14 rounded-2xl font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center
                style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center py-10>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4>
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              <Loader2 size={48} className="animate-spin" />
            </div
            <h2 className="text-fg font-bold text-2xl>Processing Payment</h2>
            <p className="text-muted text-sm>
              Please wait while we process your payment...
            </p>
          </div>
        )}

        {/* Step 8: Success */}
        {step === "success" && (
          <div className="flex flex-col items-center py-10 gap-4>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4>
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              <CheckCircle size={48} className="text-white" />
            </div>
            <h2 className="text-fg font-bold text-2xl>Transfer Successful!</h2>
            <p className="text-gold font-bold text-4xl>
              ₦{formatBalance(successAmt)}
            </p>
            <p className="text-muted text-sm text-center>
              Sent to {transfer.recipientName} at {transfer.recipientBankName}
            </p>

            <button
              onClick={reset}
              className="w-full h-14 rounded-2xl font-semibold text-base text-white mt-6 transition-opacity hover:opacity-90
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              Send Another
            </button>
            <button
              onClick={() => { reset(); navigate("/dashboard"); }}
              className="w-full h-12 rounded-2xl font-semibold text-base border border-border text-fg hover:border-gold/40 transition-colors
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Step 9: Error */}
        {step === "error" && (
          <div className="flex flex-col items-center py-10 gap-4>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4>
              style={{ background: "linear-gradient(135deg, #FF0000, #CC0000)" }}
            >
              <CheckCircle size={48} className="text-white" />
            </div>
            <h2 className="text-fg font-bold text-2xl>Transfer Failed</h2>
            <p className="text-red text-xl>{error}</p>

            <button
              onClick={() => setStep("allocate-amount")}
              className="w-full h-14 rounded-2xl font-semibold text-base text-white mt-6 transition-opacity hover:opacity-90
              style={{ background: "linear-gradient(135deg, #C9A84C, #9A7828)" }}
            >
              Try Again
            </button>
            <button
              onClick={() => { reset(); navigate("/dashboard"); }}
              className="w-full h-12 rounded-2xl font-semibold text-base border border-border text-fg hover:border-gold/40 transition-colors
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}