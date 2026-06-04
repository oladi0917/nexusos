import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { TransactionItem } from "../components/TransactionItem";
import { api, type Transaction } from "../lib/api";
import { formatBalance } from "../lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

type Filter = "all" | "credit" | "debit";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "credit", label: "Income" },
  { key: "debit", label: "Expenses" },
];

export default function Transactions() {
  const navigate = useNavigate();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    api
      .get<Transaction[]>("/transactions?limit=100")
      .then(setTxs)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? txs : txs.filter((t) => t.type === filter);

  const totalIn = txs.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <Layout title="Transactions">
      <div className="px-5 pb-6">
        {/* Stats card */}
        <div className="flex gap-3 mt-4 mb-5">
          <div className="flex-1 bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft size={16} className="text-green" />
            </div>
            <div>
              <p className="text-muted text-xs">Total In</p>
              <p className="text-green font-bold text-sm">₦{formatBalance(totalIn)}</p>
            </div>
          </div>
          <div className="flex-1 bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red/10 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={16} className="text-red" />
            </div>
            <div>
              <p className="text-muted text-xs">Total Out</p>
              <p className="text-red font-bold text-sm">₦{formatBalance(totalOut)}</p>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                filter === key
                  ? "bg-gold text-bg"
                  : "bg-card border border-border text-muted hover:border-gold/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-16 text-muted text-sm">
            No {filter !== "all" ? filter : ""} transactions found
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl px-4">
            {filtered.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onClick={() => navigate(`/transactions/${tx.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
