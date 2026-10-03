import React from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Share2 } from "lucide-react";
import { formatBalance, formatDate } from "../lib/utils";
import type { Transaction } from "../lib/api";

interface TransactionItemProps {
  tx: Transaction;
  onClick?: () => void;
}

export function TransactionItem({ tx, onClick }: TransactionItemProps) {
  const isCredit = tx.type === "credit";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 py-3 border-b border-border last:border-0 ${
        onClick ? "cursor-pointer hover:bg-card/50 rounded-lg px-2 -mx-2 transition-colors" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCredit ? "bg-green/10" : "bg-red/10"
        }`}
      >
        {isCredit ? (
          <ArrowDownLeft size={18} className="text-green" />
        ) : (
          <ArrowUpRight size={18} className="text-red" />
        )}
        {tx.isShared && (
          <Share2 size={14} className="text-gold" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="text-fg text-sm font-semibold truncate">
          {tx.description}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: tx.bankColor }}
          />
          <span className="text-muted text-xs truncate">
            {tx.bankName} · {formatDate(tx.createdAt)}
          </span>
        </div>
      </div>

      {/* Amount + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`font-bold text-sm ${isCredit ? "text-green" : "text-red"}`}
        >
          {isCredit ? "+" : "-"}₦{formatBalance(tx.amount)}
        </span>
        {onClick && <ChevronRight size={16} className="text-muted" />}
      </div>
    </div>
  );
}
