import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, Plus, Send } from "lucide-react";
import { Layout } from "../components/Layout";
import { TransactionItem } from "../components/TransactionItem";
import { useAuth } from "../context/AuthContext";
import { api, type DashboardData } from "../lib/api";
import { formatBalance } from "../lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const income = data?.recentTransactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0) ?? 0;
  const expenses = data?.recentTransactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <Layout showLogo>
      <div className="px-5 pb-6">
        {/* Greeting */}
        <div className="mb-5 mt-2">
          <p className="text-muted text-sm">Good day,</p>
          <h2 className="text-fg font-bold text-2xl">
            {user ? `${user.firstName} ${user.lastName}` : "User"}
          </h2>
        </div>

        {/* Balance card */}
        <div
          className="relative rounded-3xl p-6 overflow-hidden mb-5"
          style={{
            background: "linear-gradient(145deg, #1E1A0E 0%, #181818 60%, #0C0C0C 100%)",
            border: "1px solid #3A3010",
            boxShadow: "0 0 40px rgba(201,168,76,0.12)",
          }}
        >
          {/* Decorative rings */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-gold/10 pointer-events-none"
            style={{ borderWidth: 1 }}
          />
          <div
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full border border-gold/10 pointer-events-none"
          />

          <p className="text-muted text-xs font-medium tracking-widest uppercase mb-1">
            Total Balance
          </p>
          {loading ? (
            <div className="h-10 w-48 bg-card rounded-lg animate-pulse mb-4" />
          ) : (
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: "#C9A84C" }}
            >
              ₦{formatBalance(data?.totalBalance ?? 0)}
            </h2>
          )}

          {/* Stats row */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center">
                <ArrowDownLeft size={16} className="text-green" />
              </div>
              <div>
                <p className="text-muted text-xs">Income</p>
                <p className="text-fg font-semibold text-sm">
                  ₦{formatBalance(income)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red/10 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-red" />
              </div>
              <div>
                <p className="text-muted text-xs">Expenses</p>
                <p className="text-fg font-semibold text-sm">
                  ₦{formatBalance(expenses)}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-end">
              <span className="text-muted text-xs">
                {data?.accountCount ?? 0} account
                {(data?.accountCount ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("/send")}
            className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-gold/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center">
              <Send size={18} className="text-gold" />
            </div>
            <span className="text-fg font-semibold text-sm">Send Money</span>
          </button>
          <button
            onClick={() => navigate("/accounts/add")}
            className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-gold/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center">
              <Plus size={18} className="text-gold" />
            </div>
            <span className="text-fg font-semibold text-sm">Add Account</span>
          </button>
        </div>

        {/* Recent transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-fg font-bold text-base">Recent Activity</h3>
            <button
              onClick={() => navigate("/transactions")}
              className="text-gold text-sm font-semibold hover:underline"
            >
              See all
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !data?.recentTransactions.length ? (
            <div className="text-center py-10 text-muted text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl px-4">
              {data.recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
