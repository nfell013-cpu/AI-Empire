"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Star,
  AlertTriangle,
  Target,
  Clock,
  DollarSign,
  Zap,
  Bitcoin,
  LineChart,
  Gem,
} from "lucide-react";

interface UserStats {
  trendPulseSubscribed: boolean;
  trendPulseAnalyses: number;
  trendPulseFreeUsed: boolean;
  trendPulseSubExpiresAt: string | null;
}

interface Analysis {
  assetName: string;
  assetType: string;
  currentPrice: string;
  sentiment: string;
  confidenceScore: number;
  priceTargets: {
    shortTerm: { low: number; high: number; timeframe: string };
    mediumTerm: { low: number; high: number; timeframe: string };
    longTerm: { low: number; high: number; timeframe: string };
  };
  keyFactors: { factor: string; impact: string; description: string }[];
  riskLevel: string;
  technicalIndicators: { name: string; signal: string; value: string }[];
  recommendation: string;
  summary: string;
}

const ASSET_TYPES = [
  { id: "stock", label: "Stocks", icon: LineChart, examples: "AAPL, TSLA, GOOGL" },
  { id: "crypto", label: "Crypto", icon: Bitcoin, examples: "BTC, ETH, SOL" },
  { id: "commodity", label: "Commodities", icon: Gem, examples: "Gold, Silver, Oil" },
];

const TIMEFRAMES = [
  { id: "short", label: "Short Term", desc: "1-4 weeks" },
  { id: "medium", label: "Medium Term", desc: "1-6 months" },
  { id: "long", label: "Long Term", desc: "6-12 months" },
];

export default function TrendPulseClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("stock");
  const [timeframe, setTimeframe] = useState("medium");
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error" | "paywall">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/trendpulse/stats");
    const data = await res.json();
    setUserStats(data);
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/trendpulse/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Failed to start checkout");
    }
    setLoadingCheckout(false);
  };

  const handleAnalyze = async () => {
    if (!assetName.trim()) {
      setError("Please enter an asset name or ticker");
      return;
    }

    if (!userStats?.trendPulseSubscribed && userStats?.trendPulseFreeUsed) {
      setStatus("paywall");
      return;
    }

    setStatus("analyzing");
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/trendpulse/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetName, assetType, timeframe }),
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "bullish": return "text-green-400";
      case "bearish": return "text-red-400";
      default: return "text-yellow-400";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "bullish": return <TrendingUp className="w-6 h-6 text-green-400" />;
      case "bearish": return <TrendingDown className="w-6 h-6 text-red-400" />;
      default: return <Minus className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "text-green-400 bg-green-500/20 border-green-500/30";
      case "medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      default: return "text-red-400 bg-red-500/20 border-red-500/30";
    }
  };

  const getSignalColor = (signal: string) => {
    const s = signal.toLowerCase();
    if (s.includes("buy") || s.includes("bullish")) return "text-green-400";
    if (s.includes("sell") || s.includes("bearish")) return "text-red-400";
    return "text-yellow-400";
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500">
            <BarChart2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">TrendPulse</h1>
            <p className="text-gray-400">AI Market Trend Predictor</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {!userStats?.trendPulseSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-white">
                {userStats?.trendPulseFreeUsed
                  ? "Subscribe for unlimited market analyses"
                  : "Analyze your first asset free!"}
              </span>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg text-black font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star className="w-4 h-4" />
              )}
              Subscribe - $29/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${userStats.trendPulseSubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.trendPulseSubscribed ? "Subscribed" : "Free Trial"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Analyses Done</p>
            <p className="text-white font-semibold">{userStats.trendPulseAnalyses}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Free Trial</p>
            <p className={`font-semibold ${userStats.trendPulseFreeUsed ? "text-gray-500" : "text-green-400"}`}>
              {userStats.trendPulseFreeUsed ? "Used" : "Available"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Expires</p>
            <p className="text-white font-semibold">
              {userStats.trendPulseSubExpiresAt
                ? new Date(userStats.trendPulseSubExpiresAt).toLocaleDateString()
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
            <BarChart2 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Analyses</h2>
            <p className="text-gray-400 mb-6">
              Subscribe to TrendPulse for $29/month and predict market trends.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl text-black font-semibold hover:opacity-90 transition-opacity"
            >
              {loadingCheckout ? "Loading..." : "Subscribe Now - $29/mo"}
            </button>
          </motion.div>
        ) : status === "done" && analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Main Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{analysis.assetName}</h2>
                  <p className="text-gray-400">{analysis.assetType} • {analysis.currentPrice}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getSentimentIcon(analysis.sentiment)}
                  <div>
                    <p className={`text-xl font-bold ${getSentimentColor(analysis.sentiment)}`}>
                      {analysis.sentiment.toUpperCase()}
                    </p>
                    <p className="text-gray-400 text-sm">{analysis.confidenceScore}% confidence</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-300">{analysis.summary}</p>
            </div>

            {/* Price Targets */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" /> Price Targets
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {["shortTerm", "mediumTerm", "longTerm"].map((term) => {
                  const target = analysis.priceTargets[term as keyof typeof analysis.priceTargets];
                  return (
                    <div key={term} className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">{target.timeframe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-white font-semibold">
                          ${target.low.toLocaleString()} - ${target.high.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk & Recommendation */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-5 rounded-xl border ${getRiskColor(analysis.riskLevel)}`}>
                <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Risk Level
                </h4>
                <p className="text-2xl font-bold">{analysis.riskLevel.toUpperCase()}</p>
              </div>
              <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">AI Recommendation</h4>
                <p className="text-white">{analysis.recommendation}</p>
              </div>
            </div>

            {/* Key Factors */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Key Factors
              </h4>
              <div className="space-y-3">
                {analysis.keyFactors.map((factor, i) => (
                  <div key={i} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{factor.factor}</span>
                      <span className={`text-sm px-2 py-0.5 rounded ${
                        factor.impact.toLowerCase() === "positive" 
                          ? "bg-green-500/20 text-green-400"
                          : factor.impact.toLowerCase() === "negative"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {factor.impact}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-purple-400" /> Technical Indicators
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analysis.technicalIndicators.map((ind, i) => (
                  <div key={i} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg text-center">
                    <p className="text-gray-400 text-sm">{ind.name}</p>
                    <p className="text-white font-medium">{ind.value}</p>
                    <p className={`text-sm ${getSignalColor(ind.signal)}`}>{ind.signal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
              <p className="text-yellow-400 text-sm">
                ⚠️ This analysis is for informational purposes only and not financial advice. 
                Always do your own research before making investment decisions.
              </p>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setAnalysis(null);
                setAssetName("");
              }}
              className="w-full py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              Analyze Another Asset
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Asset Type */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3">Asset Type</label>
              <div className="grid grid-cols-3 gap-3">
                {ASSET_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setAssetType(type.id)}
                      className={`p-4 rounded-xl border transition-all text-center ${
                        assetType === type.id
                          ? "border-amber-500 bg-amber-500/20 text-white"
                          : "border-[var(--color-border)] text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-gray-400">{type.examples}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Asset Name */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" /> Asset Name / Ticker
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder={assetType === "stock" ? "e.g., AAPL, Tesla, NVDA" : assetType === "crypto" ? "e.g., Bitcoin, ETH, Solana" : "e.g., Gold, Silver, Oil"}
                className="w-full p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Timeframe */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Analysis Timeframe
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      timeframe === tf.id
                        ? "border-amber-500 bg-amber-500/20 text-white"
                        : "border-[var(--color-border)] text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <p className="font-medium">{tf.label}</p>
                    <p className="text-sm text-gray-400">{tf.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={status === "analyzing"}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "analyzing" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Market Trends...
                </>
              ) : (
                <>
                  <BarChart2 className="w-5 h-5" />
                  Analyze Trends
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
