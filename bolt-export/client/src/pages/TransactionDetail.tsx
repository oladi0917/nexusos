import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Loader2, Share2 } from "lucide-react";
import { api, type Transaction } from "../lib/api";
import { formatBalance, formatDate, formatTime } from "../lib/utils";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-fg text-sm font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharingLoading, setSharingLoading] = useState(false);

  useEffect(() => {
    api
      .get<Transaction>(`/transactions/${id}`)
      .then(setTx)
      .catch(() => setError("Transaction not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted text-sm">{error || "Not found"}</p>
        <button onClick={() => navigate(-1)} className="text-gold text-sm font-semibold">
          Go back
        </button>
      </div>
    );
  }

  const isCredit = tx.type === "credit";

  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors"
          >
            <ArrowLeft size={18} className="text-fg" />
          </button>
          <h1 className="text-fg font-bold text-xl">Transaction</h1>
        </div>
        <button
          onClick={async () => {
            setSharingLoading(true);
            // Optimistically update the shared status
            setTx(prevTx => {
              if (!prevTx) return prevTx;
              return { ...prevTx, isShared: !prevTx.isShared };
            });
            try {
              await api.patch(`/transactions/${id}/toggle-share`);
              // If successful, the optimistic update is already applied
              // We'll still fetch to ensure consistency with server state
              const updatedTx = await api.get<Transaction>(`/transactions/${id}`);
              setTx(updatedTx);
            } catch (err: any) {
              // Rollback the optimistic update on error
              setTx(prevTx => {
                if (!prevTx) return prevTx;
                return { ...prevTx, isShared: !prevTx.isShared };
              });
              setError(
                err.response?.data?.error ||
                  err.message ||
                  "Failed to update share status"
              );
            } finally {
              setSharingLoading(false);
            }
          }}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/40 transition-colors"
          disabled={sharingLoading}
        >
          {sharingLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              {tx?.isShared ? (
                <Share2 size={18} className="text-gold" />
              ) : (
                <Share2 size={18} className="text-muted" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center py-10 px-5">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isCredit ? "bg-green/10" : "bg-red/10"
          }`}
        >
          {isCredit ? (
            <ArrowDownLeft size={36} className="text-green" />
          ) : (
            <ArrowUpRight size={36} className="text-red" />
          )}
        </div>

        <span
          className={`text-4xl font-bold mb-2 ${isCredit ? "text-green" : "text-red"}`}
        >
          {isCredit ? "+" : "-"}₦{formatBalance(tx.amount)}
        </span>

        <span className="text-fg font-semibold text-base">{tx.description}</span>
        <span className="text-muted text-sm mt-1">
          {formatDate(tx.createdAt)} at {formatTime(tx.createdAt)}
        </span>
      </div>

      {/* Details card */}
      <div className="mx-5 bg-card border border-border rounded-2xl px-5">
        <Row label="Type" value={isCredit ? "Credit" : "Debit"} />
        <Row label="Amount" value={`₦${formatBalance(tx.amount)} ${tx.currency}`} />
        <Row label="Account" value={tx.bankName} />
        <Row label="Account Name" value={tx.accountName} />
        {tx.category && <Row label="Category" value={tx.category} />}
        {tx.recipientName && <Row label="Recipient" value={tx.recipientName} />}
        {tx.recipientBank && <Row label="Recipient Bank" value={tx.recipientBank} />}
        {tx.note && <Row label="Note" value={tx.note} />}
        <Row label="Date" value={formatDate(tx.createdAt)} />
        <Row label="Time" value={formatTime(tx.createdAt)} />
        <Row label="Shared" value={tx.isShared ? "Yes" : "No"} />
        <Row label="Reference" value={`TXN${String(tx.id).padStart(8, "0")}`} />
      </div>
    </div>
  );
}
