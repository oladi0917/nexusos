import React, { useEffect, useState } from "react";
import { api, type Transaction, type UserProfile, type CreditScoreData, type InsightsData, type ActionsData } from "../lib/api";
import { formatBalance } from "../lib/utils";
import { TransactionItem } from "../components/TransactionItem";

const NexusPage: React.FC = () => {
  const [sharedTransactions, setSharedTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [creditScoreData, setCreditScoreData] = useState<CreditScoreData | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [actionsData, setActionsData] = useState<ActionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user profile
        const profileResponse = await api.get<UserProfile>("/users/profile");
        setUserProfile(profileResponse);

        // Fetch shared transactions
        const transactionsResponse = await api.get<Transaction[]>("/transactions/shared");
        setSharedTransactions(transactionsResponse);

        // Fetch AI credit score data
        const creditScoreResponse = await api.get<CreditScoreData>("/ai/credit-score");
        setCreditScoreData(creditScoreResponse);

        // Fetch AI insights
        const insightsResponse = await api.get<InsightsData>("/ai/insights");
        setInsightsData(insightsResponse);

        // Fetch AI actions
        const actionsResponse = await api.get<ActionsData>("/ai/actions");
        setActionsData(actionsResponse);

        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleActionClick = (action: any) => {
    // Handle different action types with appropriate functionality
    switch (action.title) {
      case "Subscription Optimization":
        // In a real app, this might navigate to a subscription management screen
        alert(`Feature coming soon: View and manage your recurring subscriptions\n\n${action.description}`);
        break;
      case "Bill Negotiation Opportunity":
        // In a real app, this might show negotiation scripts or tips
        alert(`Feature coming soon: Access bill negotiation scripts and tips\n\n${action.description}`);
        break;
      case "Investment Opportunity":
        // In a real app, this might navigate to investment recommendations
        alert(`Feature coming soon: View personalized investment recommendations\n\n${action.description}`);
        break;
      case "Emergency Fund Building":
      case "Emergency Fund Status":
        // In a real app, this might show emergency fund calculator
        alert(`Feature coming soon: Use emergency fund calculator and tracker\n\n${action.description}`);
        break;
      case "Income Optimization":
        // In a real app, this might show income enhancement suggestions
        alert(`Feature coming soon: Access income optimization resources\n\n${action.description}`);
        break;
      case "Get Started":
        // In a real app, this might guide user to add first transaction
        alert(`Let's get started! Add your first transaction to begin receiving personalized insights\n\n${action.description}`);
        break;
      case "Financial Health Check":
        // In a real app, this might show overall financial health dashboard
        alert(`Your financial health looks good! Keep tracking for continued insights\n\n${action.description}`);
        break;
      default:
        // Generic handler for other actions
        alert(`Action: ${action.title}\n\n${action.description}`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
        <h1 className="text-fg font-bold text-2xl mb-4">Nexus</h1>
        <p className="text-red text-center">{error}</p>
        <p className="text-muted text-center mt-4">
          Please try again later or check your connection.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-fg font-bold text-xl">Nexus</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* User Financial Info */}
        {userProfile && (
          <div className="mb-6 p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center">
                <span className="text-gold font-bold">{userProfile.firstName?.charAt(0) ?? '?'}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-fg font-bold">{`${userProfile.firstName} ${userProfile.lastName}`}</h2>
                <p className="text-muted text-sm">Financial ID: {userProfile.financialId ?? 'N/A'}</p>
              </div>
            </div>

            {/* Credit Score */}
            <div className="mb-4">
              <h3 className="text-fg font-semibold mb-2">Credit Score</h3>
              <div className="flex items-center">
                {creditScoreData ? (
                  <>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2">
                      {creditScoreData.creditScore >= 750 ? (
                        <span className="text-green font-bold text-xl">{creditScoreData.creditScore}</span>
                      ) : creditScoreData.creditScore >= 650 ? (
                        <span className="text-yellow-500 font-bold text-xl">{creditScoreData.creditScore}</span>
                      ) : (
                        <span className="text-red font-bold text-xl">{creditScoreData.creditScore}</span>
                      )}
                    </div>
                    <span className="ml-3 text-fg">
                      {creditScoreData.creditScore >= 750 ? "Excellent" : creditScoreData.creditScore >= 650 ? "Good" : "Fair"}
                    </span>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">Credit score being calculated...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Analytics & Insights */}
        <div className="mb-6">
          <h2 className="text-fg font-bold text-xl mb-4">Nexus AI Assistant</h2>
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-fg font-lg mb-3">Financial Insights</h3>
            <div className="space-y-3">
              {insightsData && insightsData.insights.map((insight) => (
                <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg" key={insight.id}>
                  <div>
                    <h4 className="text-fg font-semibold">{insight.title}</h4>
                    <p className="text-muted text-sm">{insight.description}</p>
                  </div>
                  <span className={`
                    text-${insight.type === "positive" ? "green" : insight.type === "negative" ? "red" : "gold"}
                    font-bold
                  `}>
                    {insight.type === "positive" ? "↑" : insight.type === "negative" ? "↓" : "💡"}
                  </span>
                </div>
              ))}
              {!insightsData || insightsData.insights.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">Generating insights...</p>
                </div>
              )}
            </div>

            {/* AI Action Preparation */}
            <div className="mt-4">
              <h3 className="text-fg font-lg mb-3">AI Action Preparation</h3>
              <p className="text-muted text-sm mb-3">
                Based on your financial patterns, the AI assistant can prepare actions for your review:
              </p>
              <div className="space-y-2">
                {actionsData && actionsData.actions.map((action) => (
                  <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg" key={action.id}>
                    <div>
                      <h4 className="text-fg font-semibold">{action.title}</h4>
                      <p className="text-muted text-sm">{action.description}</p>
                    </div>
                    <div className="flex items-center">
                      {action.estimatedSavings !== undefined ? (
                        <span className="text-gold font-bold">Save ${action.estimatedSavings}/mo</span>
                      ) : action.estimatedReturn !== undefined ? (
                        <span className="text-gold font-bold">{action.estimatedReturn}</span>
                      ) : (
                        <span className="text-muted">Learn more</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleActionClick(action)}
                      className={`
                        text-${action.type === "suggestion" ? "gold" : action.type === "info" ? "blue" : action.type === "warning" ? "orange" : "gold"}
                        font-semibold hover:text-${action.type === "suggestion" ? "gold/80" : action.type === "info" ? "blue/80" : action.type === "warning" ? "orange/80" : "gold/80"}
                      `}
                    >
                      {action.type === "suggestion" ? "💡" : action.type === "info" ? "ℹ️" : action.type === "warning" ? "⚠️" : "💡"}
                      Review
                    </button>
                  </div>
                ))}
                {!actionsData || actionsData.actions.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">Preparing AI actions...</p>
                  </div>
                )}
              }
            </div>
          </div>
        </div>

        {/* Shared Transactions Feed */}
        <h2 className="text-fg font-bold text-xl mb-4">Shared Transactions</h2>
        {sharedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted text-sm">
              No shared transactions yet. Share transactions from your
              activity feed to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedTransactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NexusPage;