"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Globe,
  MessageSquare,
  Lightbulb,
  User,
  Building,
  Briefcase,
} from "lucide-react";

interface UserStats {
  guardianAISubscribed: boolean;
  guardianAIScans: number;
  guardianAIFreeUsed: boolean;
  guardianAISubExpiresAt: string | null;
}

interface Mention {
  source: string;
  sentiment: string;
  summary: string;
  date: string;
  impact: string;
}

interface Analysis {
  overallScore: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  reputationStatus: string;
  keyFindings: string[];
  mentions: Mention[];
  recommendations: string[];
  riskAreas: string[];
  opportunities: string[];
}

const SCAN_TYPES = [
  { id: "personal", label: "Personal", icon: User, desc: "Your personal online presence" },
  { id: "brand", label: "Brand", icon: Building, desc: "Your brand or company" },
  { id: "business", label: "Business", icon: Briefcase, desc: "Business reputation" },
];

export default function GuardianAIClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanType, setScanType] = useState("personal");
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error" | "paywall">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/guardianai/stats");
    const data = await res.json();
    setUserStats(data);
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/guardianai/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Failed to start checkout");
    }
    setLoadingCheckout(false);
  };

  const handleScan = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a name or brand to scan");
      return;
    }

    if (!userStats?.guardianAISubscribed && userStats?.guardianAIFreeUsed) {
      setStatus("paywall");
      return;
    }

    setStatus("scanning");
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/guardianai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery, scanType }),
      });

      if (res.status === 402) {
        setStatus("paywall");
        return;
      }

      if (!res.ok) throw new Error("Scan failed");

      const data = await res.json();
      setAnalysis(data.analysis);
      setStatus("done");
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive": return <ThumbsUp className="w-4 h-4 text-green-400" />;
      case "negative": return <ThumbsDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">GuardianAI</h1>
            <p className="text-gray-400">AI Online Reputation Monitor</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {!userStats?.guardianAISubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-red-400" />
              <span className="text-white">
                {userStats?.guardianAIFreeUsed
                  ? "Subscribe for unlimited reputation scans"
                  : "Run your first reputation scan free!"}
              </span>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star className="w-4 h-4" />
              )}
              Subscribe - $25/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${userStats.guardianAISubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.guardianAISubscribed ? "Subscribed" : "Free Trial"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Scans Completed</p>
            <p className="text-white font-semibold">{userStats.guardianAIScans}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Free Trial</p>
            <p className={`font-semibold ${userStats.guardianAIFreeUsed ? "text-gray-500" : "text-green-400"}`}>
              {userStats.guardianAIFreeUsed ? "Used" : "Available"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Expires</p>
            <p className="text-white font-semibold">
              {userStats.guardianAISubExpiresAt
                ? new Date(userStats.guardianAISubExpiresAt).toLocaleDateString()
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
            <ShieldCheck className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Scans</h2>
            <p className="text-gray-400 mb-6">
              Subscribe to GuardianAI for $25/month and protect your online reputation.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {loadingCheckout ? "Loading..." : "Subscribe Now - $25/mo"}
            </button>
          </motion.div>
        ) : status === "done" && analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Reputation Score</h3>
                  <p className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}/100
                  </p>
                  <p className="text-white mt-2">{analysis.reputationStatus}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-400">{analysis.sentimentBreakdown.positive}%</p>
                    <p className="text-gray-400 text-xs">Positive</p>
                  </div>
                  <div className="text-center">
                    <Minus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-400">{analysis.sentimentBreakdown.neutral}%</p>
                    <p className="text-gray-400 text-xs">Neutral</p>
                  </div>
                  <div className="text-center">
                    <ThumbsDown className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-400">{analysis.sentimentBreakdown.negative}%</p>
                    <p className="text-gray-400 text-xs">Negative</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" /> Key Findings
              </h4>
              <ul className="space-y-2">
                {analysis.keyFindings.map((finding, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400">•</span> {finding}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mentions */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" /> Recent Mentions
              </h4>
              <div className="space-y-3">
                {analysis.mentions.map((mention, i) => (
                  <div key={i} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{mention.source}</span>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(mention.sentiment)}
                        <span className="text-gray-400 text-sm">{mention.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{mention.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">Impact: {mention.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Areas & Opportunities */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30">
                <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Risk Areas
                </h4>
                <ul className="space-y-2">
                  {analysis.riskAreas.map((risk, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-red-400">!</span> {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/30">
                <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Opportunities
                </h4>
                <ul className="space-y-2">
                  {analysis.opportunities.map((opp, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-green-400">✓</span> {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" /> Recommendations
              </h4>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="text-orange-400 font-bold">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setAnalysis(null);
                setSearchQuery("");
              }}
              className="w-full py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              Run Another Scan
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Search Query */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-red-400" /> Name or Brand to Monitor
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., John Smith or Acme Corporation"
                className="w-full p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Scan Type */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3">Scan Type</label>
              <div className="grid grid-cols-3 gap-3">
                {SCAN_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setScanType(type.id)}
                      className={`p-4 rounded-xl border transition-all text-center ${
                        scanType === type.id
                          ? "border-red-500 bg-red-500/20 text-white"
                          : "border-[var(--color-border)] text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs opacity-70">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleScan}
              disabled={status === "scanning"}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "scanning" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning Online Reputation...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Scan Reputation
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
