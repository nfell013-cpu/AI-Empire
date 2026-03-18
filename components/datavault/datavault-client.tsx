"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  FileText,
  Upload,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Star,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
} from "lucide-react";

interface UserStats {
  dataVaultSubscribed: boolean;
  dataVaultReports: number;
  dataVaultFreeUsed: boolean;
  dataVaultSubExpiresAt: string | null;
}

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface Analysis {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  spendingByCategory: SpendingCategory[];
  topExpenseCategories: string[];
  monthlyTrend: string;
  financialHealth: string;
  recommendations: string[];
  budgetSuggestions: { category: string; suggested: number; current: number }[];
  alerts: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "bg-blue-500",
  Food: "bg-green-500",
  Transportation: "bg-yellow-500",
  Entertainment: "bg-purple-500",
  Shopping: "bg-pink-500",
  Utilities: "bg-cyan-500",
  Healthcare: "bg-red-500",
  Education: "bg-indigo-500",
  Other: "bg-gray-500",
};

export default function DataVaultClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "done" | "error" | "paywall">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/datavault/stats");
    const data = await res.json();
    setUserStats(data);
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/datavault/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Failed to start checkout");
    }
    setLoadingCheckout(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a CSV file");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your transaction data");
      return;
    }

    if (!userStats?.dataVaultSubscribed && userStats?.dataVaultFreeUsed) {
      setStatus("paywall");
      return;
    }

    setStatus("uploading");
    setError("");
    setAnalysis(null);

    try {
      const content = await file.text();
      setStatus("analyzing");

      const res = await fetch("/api/datavault/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent: content,
          fileName: file.name,
        }),
      });

      if (res.status === 402) {
        setStatus("paywall");
        return;
      }

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setAnalysis(data.analysis);
      setStatus("done");
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DataVault</h1>
            <p className="text-gray-400">AI Personal Finance Analyzer</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {!userStats?.dataVaultSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span className="text-white">
                {userStats?.dataVaultFreeUsed
                  ? "Subscribe for unlimited financial reports"
                  : "Analyze your first statement free!"}
              </span>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star className="w-4 h-4" />
              )}
              Subscribe - $22/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${userStats.dataVaultSubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.dataVaultSubscribed ? "Subscribed" : "Free Trial"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Reports Generated</p>
            <p className="text-white font-semibold">{userStats.dataVaultReports}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Free Trial</p>
            <p className={`font-semibold ${userStats.dataVaultFreeUsed ? "text-gray-500" : "text-green-400"}`}>
              {userStats.dataVaultFreeUsed ? "Used" : "Available"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Expires</p>
            <p className="text-white font-semibold">
              {userStats.dataVaultSubExpiresAt
                ? new Date(userStats.dataVaultSubExpiresAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {status === "paywall" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center"
          >
            <Database className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Reports</h2>
            <p className="text-gray-400 mb-6">
              Subscribe to DataVault for $22/month and take control of your finances.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {loadingCheckout ? "Loading..." : "Subscribe Now - $22/mo"}
            </button>
          </motion.div>
        ) : status === "done" && analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(analysis.totalIncome)}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                  <span className="text-gray-400 text-sm">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(analysis.totalExpenses)}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Net Savings</span>
                </div>
                <p className={`text-2xl font-bold ${analysis.netSavings >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {formatCurrency(analysis.netSavings)}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Savings Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {analysis.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Financial Health */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" /> Financial Health: {analysis.financialHealth}
              </h3>
              <p className="text-gray-400">{analysis.monthlyTrend}</p>
            </div>

            {/* Spending Breakdown */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Spending Breakdown
              </h3>
              <div className="space-y-3">
                {analysis.spendingByCategory.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{cat.category}</span>
                      <span className="text-white font-medium">
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${CATEGORY_COLORS[cat.category] || "bg-gray-500"} rounded-full transition-all`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            {analysis.alerts.length > 0 && (
              <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Financial Alerts</h4>
                <ul className="space-y-2">
                  {analysis.alerts.map((alert, i) => (
                    <li key={i} className="text-gray-300">{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" /> AI Recommendations
              </h4>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="text-emerald-400 font-bold">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setAnalysis(null);
                setFile(null);
              }}
              className="w-full py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              Analyze Another Statement
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-dashed border-[var(--color-border)] hover:border-emerald-500/50 transition-colors cursor-pointer text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-12 h-12 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">Upload Transaction Data</p>
                  <p className="text-gray-400 text-sm">CSV files from your bank statement</p>
                </>
              )}
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <p className="text-gray-400 text-sm">
                <strong className="text-white">Tip:</strong> Export your bank transactions as CSV. 
                DataVault analyzes spending patterns, identifies savings opportunities, and provides personalized financial advice.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={status === "uploading" || status === "analyzing" || !file}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "uploading" || status === "analyzing" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {status === "uploading" ? "Uploading..." : "Analyzing Finances..."}
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Analyze My Finances
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
