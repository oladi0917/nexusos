import React from "react";
import { Star } from "lucide-react";
import { formatBalance, maskAccountNumber } from "../lib/utils";
import type { Account } from "../lib/api";

interface AccountCardProps {
  account: Account;
  isPrimary?: boolean;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function AccountCard({
  account,
  isPrimary = false,
  compact = false,
  selected = false,
  onClick,
}: AccountCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${
        selected
          ? "border-gold bg-gold-light"
          : "border-border bg-card hover:border-gold/40"
      } ${compact ? "p-4" : "p-5"} overflow-hidden`}
    >
      {/* Colored bottom glow strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
        style={{ backgroundColor: account.bankColor }}
      />

      <div className="flex items-center gap-3">
        {/* Bank color circle */}
        <div
          className="rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
          style={{
            backgroundColor: account.bankColor,
            width: compact ? 36 : 44,
            height: compact ? 36 : 44,
          }}
        >
          {account.bankName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-fg truncate ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {account.bankName}
            </span>
            {account.accountType && account.accountType !== "checking" && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gold-light text-gold text-xs font-semibold flex-shrink-0">
                {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
              </span>
            )}
            {isPrimary && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gold-light text-gold text-xs font-semibold flex-shrink-0">
                <Star size={10} fill="#C9A84C" />
                Primary
              </span>
            )}
          </div>
          <span className="text-muted text-xs font-mono">
            {maskAccountNumber(account.accountNumber)}
          </span>
        </div>

        {!compact && (
          <div className="text-right">
            <div className="text-fg font-bold text-base">
              ₦{formatBalance(account.balance)}
            </div>
            <div className="text-muted text-xs">{account.currency}</div>
          </div>
        )}
      </div>

      {compact && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-fg font-bold text-lg">
            ₦{formatBalance(account.balance)}
          </span>
          <span className="text-muted text-xs ml-2">{account.currency}</span>
        </div>
      )}
    </div>
  );
}
