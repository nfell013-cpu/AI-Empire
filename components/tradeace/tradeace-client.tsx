"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat, Upload, Flame, Trophy, Target, BookOpen, Zap,
  CheckCircle2, Loader2, FileText, Trash2, Play, ChevronRight
} from "lucide-react";
import ManualUpload from "./manual-upload";
import QuizSession from "./quiz-session";
import ProgressStats from "./progress-stats";

interface UserStats {
  tradeAceSubscribed: boolean;
  tradeAceStreak: number;
  tradeAceTotalQuizzes: number;
  tradeAceCorrectAnswers: number;
  tradeAceSubExpiresAt: string | null;
}

interface Manual {
  id: string;
  fileName: string;
  trade: string;
  title: string | null;
  createdAt: string;
}

type ViewMode = "home" | "upload" | "quiz" | "results";

export default function TradeAceClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<string>("electrician");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    fetchUserStats();
    fetchManuals();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await fetch("/api/tradeace/stats");
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const fetchManuals = async () => {
    try {
      const res = await fetch("/api/tradeace/manuals");
      if (res.ok) {
        const data = await res.json();
        setManuals(data.manuals || []);
      }
    } catch (e) {
      console.error("Failed to fetch manuals", e);
    }
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/tradeace/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Subscription error", e);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleDeleteManual = async (id: string) => {
    try {
      await fetch(`/api/tradeace/manuals/${id}`, { method: "DELETE" });
      fetchManuals();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleStartQuiz = (manual: Manual | null, trade: string) => {
    if (!userStats?.tradeAceSubscribed) {
      handleSubscribe();
      return;
    }
    setSelectedManual(manual);
    setSelectedTrade(trade);
    setViewMode("quiz");
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizResult({ score, total });
    setViewMode("results");
    fetchUserStats();
  };

  const trades = [
    { id: "electrician", name: "Electrician", icon: "⚡", color: "#f59e0b" },
    { id: "plumber", name: "Plumber", icon: "🔧", color: "#3b82f6" },
    { id: "hvac", name: "HVAC", icon: "❄️", color: "#06b6d4" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl" style={{ background: "rgba(249, 115, 22, 0.2)" }}>
              <HardHat className="w-6 h-6" style={{ color: "#f97316" }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#fff" }}>
              Trade<span style={{ color: "#f97316" }}>Ace</span>
            </h1>
          </div>
          <p style={{ color: "#9ca3af" }}>
            Master your vocational exams with AI-powered practice drills
          </p>
        </motion.div>

        {/* Subscription Banner */}
        {userStats && !userStats.tradeAceSubscribed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.1))", border: "1px solid rgba(249,115,22,0.4)" }}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5" style={{ color: "#f97316" }} />
              <div>
                <p className="font-semibold" style={{ color: "#fff" }}>Unlock Unlimited Exams</p>
                <p className="text-sm" style={{ color: "#9ca3af" }}>$29/month for unlimited practice drills</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#000" }}
            >
              {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Subscribe Now
            </button>
          </motion.div>
        )}

        {/* Stats Bar */}
        {userStats?.tradeAceSubscribed && (
          <ProgressStats userStats={userStats} />
        )}

        <AnimatePresence mode="wait">
          {viewMode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Trade Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "#fff" }}>
                  <Target className="w-5 h-5" style={{ color: "#f97316" }} />
                  Quick Start – Practice Drill
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trades.map((trade) => (
                    <motion.button
                      key={trade.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartQuiz(null, trade.id)}
                      className="p-5 rounded-xl text-left transition-all group"
                      style={{ background: "#1f1f1f", border: "1px solid #333" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{trade.icon}</span>
                        <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: trade.color }} />
                      </div>
                      <h3 className="font-semibold text-lg" style={{ color: "#fff" }}>{trade.name}</h3>
                      <p className="text-sm" style={{ color: "#6b7280" }}>10 scenario-based questions</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Uploaded Manuals */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "#fff" }}>
                    <BookOpen className="w-5 h-5" style={{ color: "#f97316" }} />
                    Your Technical Manuals
                  </h2>
                  <button
                    onClick={() => setViewMode("upload")}
                    className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all"
                    style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Manual
                  </button>
                </div>

                {manuals.length === 0 ? (
                  <div
                    className="p-8 rounded-xl text-center"
                    style={{ background: "#1f1f1f", border: "1px dashed #333" }}
                  >
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#f97316" }} />
                    <p style={{ color: "#6b7280" }}>No manuals uploaded yet</p>
                    <p className="text-sm" style={{ color: "#4b5563" }}>Upload technical manuals to generate custom quizzes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {manuals.map((manual) => (
                      <motion.div
                        key={manual.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl flex items-center justify-between group"
                        style={{ background: "#1f1f1f", border: "1px solid #333" }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg" style={{ background: "rgba(249,115,22,0.1)" }}>
                            <FileText className="w-5 h-5" style={{ color: "#f97316" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" style={{ color: "#fff" }}>{manual.title || manual.fileName}</p>
                            <p className="text-xs capitalize" style={{ color: "#6b7280" }}>{manual.trade}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartQuiz(manual, manual.trade)}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: "rgba(249,115,22,0.15)" }}
                          >
                            <Play className="w-4 h-4" style={{ color: "#f97316" }} />
                          </button>
                          <button
                            onClick={() => handleDeleteManual(manual.id)}
                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: "rgba(239,68,68,0.15)" }}
                          >
                            <Trash2 className="w-4 h-4" style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {viewMode === "upload" && (
            <ManualUpload
              onBack={() => setViewMode("home")}
              onSuccess={() => {
                fetchManuals();
                setViewMode("home");
              }}
            />
          )}

          {viewMode === "quiz" && (
            <QuizSession
              manual={selectedManual}
              trade={selectedTrade}
              onBack={() => setViewMode("home")}
              onComplete={handleQuizComplete}
            />
          )}

          {viewMode === "results" && quizResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div
                className="inline-block p-6 rounded-full mb-6"
                style={{ background: quizResult.score >= 7 ? "rgba(16,185,129,0.2)" : quizResult.score >= 5 ? "rgba(249,115,22,0.2)" : "rgba(239,68,68,0.2)" }}
              >
                <Trophy className="w-16 h-16" style={{ color: quizResult.score >= 7 ? "#10b981" : quizResult.score >= 5 ? "#f97316" : "#ef4444" }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: "#fff" }}>
                {quizResult.score}/{quizResult.total} Correct
              </h2>
              <p className="text-lg mb-6" style={{ color: "#9ca3af" }}>
                {quizResult.score >= 7 ? "Outstanding work! 🎉" : quizResult.score >= 5 ? "Good effort! Keep practicing." : "Keep studying, you'll get there!"}
              </p>
              {userStats && (
                <div className="flex items-center justify-center gap-2 mb-8">
                  <Flame className="w-5 h-5" style={{ color: "#f97316" }} />
                  <span className="font-semibold" style={{ color: "#f97316" }}>{userStats.tradeAceStreak} Day Streak</span>
                </div>
              )}
              <button
                onClick={() => setViewMode("home")}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#000" }}
              >
                Continue Training
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
