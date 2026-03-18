"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  Star,
  Briefcase,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface UserStats {
  skillScopeSubscribed: boolean;
  skillScopeAnalyses: number;
  skillScopeFreeUsed: boolean;
  skillScopeSubExpiresAt: string | null;
}

interface Analysis {
  resumeScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  keywordMatch: number;
  experienceLevel: string;
  topSkills: string[];
  missingSkills: string[];
  overallFeedback: string;
  jobFitScore: number;
}

export default function SkillScopeClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "done" | "error" | "paywall">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/skillscope/stats");
    const data = await res.json();
    setUserStats(data);
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/skillscope/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Failed to start checkout");
    }
    setLoadingCheckout(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume");
      return;
    }

    if (!userStats?.skillScopeSubscribed && userStats?.skillScopeFreeUsed) {
      setStatus("paywall");
      return;
    }

    setStatus("uploading");
    setError("");
    setAnalysis(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setStatus("analyzing");

      const res = await fetch("/api/skillscope/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeBase64: base64,
          fileName: file.name,
          jobDescription,
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-emerald-500/20 border-green-500/30";
    if (score >= 60) return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
    return "from-red-500/20 to-rose-500/20 border-red-500/30";
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SkillScope</h1>
            <p className="text-gray-400">AI Resume Analyzer & Job Matcher</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {!userStats?.skillScopeSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span className="text-white">
                {userStats?.skillScopeFreeUsed
                  ? "Subscribe for unlimited resume analyses"
                  : "Analyze your first resume free!"}
              </span>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star className="w-4 h-4" />
              )}
              Subscribe - $16/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${userStats.skillScopeSubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.skillScopeSubscribed ? "Subscribed" : "Free Trial"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Analyses Done</p>
            <p className="text-white font-semibold">{userStats.skillScopeAnalyses}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Free Trial</p>
            <p className={`font-semibold ${userStats.skillScopeFreeUsed ? "text-gray-500" : "text-green-400"}`}>
              {userStats.skillScopeFreeUsed ? "Used" : "Available"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Expires</p>
            <p className="text-white font-semibold">
              {userStats.skillScopeSubExpiresAt
                ? new Date(userStats.skillScopeSubExpiresAt).toLocaleDateString()
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
            <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Analyses</h2>
            <p className="text-gray-400 mb-6">
              Subscribe to SkillScope for $16/month and perfect your resume.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {loadingCheckout ? "Loading..." : "Subscribe Now - $16/mo"}
            </button>
          </motion.div>
        ) : status === "done" && analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Score Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${getScoreBg(analysis.resumeScore)} border`}>
                <h3 className="text-gray-400 text-sm mb-2">Resume Score</h3>
                <p className={`text-5xl font-bold ${getScoreColor(analysis.resumeScore)}`}>
                  {analysis.resumeScore}/100
                </p>
                <p className="text-gray-400 mt-2">{analysis.experienceLevel}</p>
              </div>
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${getScoreBg(analysis.jobFitScore)} border`}>
                <h3 className="text-gray-400 text-sm mb-2">Job Fit Score</h3>
                <p className={`text-5xl font-bold ${getScoreColor(analysis.jobFitScore)}`}>
                  {analysis.jobFitScore}/100
                </p>
                <p className="text-gray-400 mt-2">{analysis.keywordMatch}% keyword match</p>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Overall Feedback
              </h3>
              <p className="text-gray-300">{analysis.overallFeedback}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-green-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-red-400">✗</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" /> Top Skills Identified
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.topSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" /> Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" /> Recommended Improvements
              </h4>
              <ul className="space-y-3">
                {analysis.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <ArrowRight className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setAnalysis(null);
                setFile(null);
                setJobDescription("");
              }}
              className="w-full py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              Analyze Another Resume
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
              className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-dashed border-[var(--color-border)] hover:border-purple-500/50 transition-colors cursor-pointer text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-12 h-12 text-purple-400" />
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
                  <p className="text-white font-medium mb-1">Upload Your Resume</p>
                  <p className="text-gray-400 text-sm">PDF files only (max 10MB)</p>
                </>
              )}
            </div>

            {/* Job Description */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" /> Target Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you're targeting for better matching..."
                rows={6}
                className="w-full p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={status === "uploading" || status === "analyzing" || !file}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "uploading" || status === "analyzing" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {status === "uploading" ? "Uploading..." : "Analyzing Resume..."}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
