import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Layout } from "../components/Layout";
import { AccountCard } from "../components/AccountCard";
import { api, type Account } from "../lib/api";
import { formatBalance } from "../lib/utils";

export default function Accounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");

  const load = () => {
    setLoading(true);
    api
      .get<Account[]>("/accounts")
      .then((accounts) => {
        if (accountTypeFilter === "all") {
          setAccounts(accounts);
        } else {
          setAccounts(accounts.filter((acc) => acc.accountType === accountTypeFilter));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [accountTypeFilter]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this account?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove account");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout title="Accounts">
      <div className="px-5 pb-6">
        {/* Account type filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setAccountTypeFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              accountTypeFilter === "all"
                ? "bg-gold text-white"
                : "bg-card text-muted hover:bg-card/50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setAccountTypeFilter("checking")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              accountTypeFilter === "checking"
                ? "bg-gold text-white"
                : "bg-card text-muted hover:bg-card/50"
            }`}
          >
            Checking
          </button>
          <button
            onClick={() => setAccountTypeFilter("savings")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              accountTypeFilter === "savings"
                ? "bg-gold text-white"
                : "bg-card text-muted hover:bg-card/50"
            }`}
          >
            Savings
          </button>
          <button
            onClick={() => setAccountTypeFilter("credit")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              accountTypeFilter === "credit"
                ? "bg-gold text-white"
                : "bg-card text-muted hover:bg-card/50"
            }`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setAccountTypeFilter("loan")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              accountTypeFilter === "loan"
                ? "bg-gold text-white"
                : "bg-card text-muted hover:bg-card/50"
            }`}
          >
            Loan
          </button>
          <button
            onClick={() => setAccountTypeFilter("investment")}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              accountTypeFilter === "investment"
                ? "bg-gold text-white"
                : "bg-card text-muted hover:bg-card/50"
            }`}
          >
            Investment
          </button>
        </div>

        {/* Summary card */}
        <div
          className="rounded-2xl p-5 mt-4 mb-5"
          style={{
            background: "linear-gradient(145deg, #1E1A0E, #181818)",
            border: "1px solid #3A3010",
            boxShadow: "0 0 30px rgba(201,168,76,0.08)",
          }}
        >
          <p className="text-muted text-xs font-medium tracking-widest uppercase mb-1">
            Total Across Accounts
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#C9A84C" }}>
            ₦{formatBalance(totalBalance)}
          </h2>
          <p className="text-muted text-xs mt-1">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
          </p>
        </div>

        {/* Add account button */}
        <button
          onClick={() => navigate("/accounts/add")}
          className="w-full h-12 rounded-xl border border-dashed border-border text-muted font-semibold text-sm flex items-center justify-center gap-2 hover:border-gold/40 hover:text-gold transition-colors mb-5"
        >
          <Plus size={16} />
          Add Account
        </button>

        {/* Account list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !accounts.length ? (
          <div className="text-center py-16 text-muted text-sm">
            No accounts connected yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {accounts.map((account, i) => (
              <div key={account.id} className="relative group">
                <AccountCard account={account} isPrimary={i === 0} />
                <button
                  onClick={() => handleDelete(account.id)}
                  disabled={deletingId === account.id}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red/10 border border-red/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red/20"
                >
                  {deletingId === account.id ? (
                    <div className="w-4 h-4 border border-red border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} className="text-red" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
