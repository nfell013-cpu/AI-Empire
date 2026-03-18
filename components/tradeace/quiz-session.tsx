"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, ChevronRight,
  Clock, HardHat, AlertTriangle
} from "lucide-react";

interface Manual {
  id: string;
  fileName: string;
  trade: string;
  title: string | null;
}

interface Question {
  id: number;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizSessionProps {
  manual: Manual | null;
  trade: string;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

export default function QuizSession({ manual, trade, onBack, onComplete }: QuizSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tradeace/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualId: manual?.id,
          trade,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate quiz");
      }

      const data = await res.json();
      setQuestions(data.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === questions[currentIndex].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete - save results
      try {
        await fetch("/api/tradeace/quiz/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trade,
            score,
            totalQuestions: questions.length,
            manualId: manual?.id,
          }),
        });
      } catch (e) {
        console.error("Failed to save quiz results", e);
      }
      onComplete(score, questions.length);
    }
  };

  const currentQuestion = questions[currentIndex];
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const tradeNames: Record<string, string> = {
    electrician: "Electrician",
    plumber: "Plumber",
    hvac: "HVAC Technician",
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="inline-block p-6 rounded-full mb-6" style={{ background: "rgba(249,115,22,0.1)" }}>
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#f97316" }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "#fff" }}>Generating Quiz...</h2>
        <p style={{ color: "#6b7280" }}>Creating {tradeNames[trade]} practice questions</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="inline-block p-6 rounded-full mb-6" style={{ background: "rgba(239,68,68,0.1)" }}>
          <AlertTriangle className="w-12 h-12" style={{ color: "#ef4444" }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "#fff" }}>Generation Failed</h2>
        <p className="mb-6" style={{ color: "#6b7280" }}>{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg"
          style={{ background: "#333", color: "#fff" }}
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          style={{ color: "#9ca3af" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Quiz
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#1f1f1f" }}>
            <Clock className="w-4 h-4" style={{ color: "#f97316" }} />
            <span className="text-sm font-mono" style={{ color: "#fff" }}>
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg" style={{ background: "#1f1f1f" }}>
            <span className="text-sm" style={{ color: "#9ca3af" }}>
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full mb-8" style={{ background: "#333" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #f97316, #ea580c)" }}
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl p-6"
          style={{ background: "#1f1f1f", border: "1px solid #333" }}
        >
          {/* Trade Badge */}
          <div className="flex items-center gap-2 mb-4">
            <HardHat className="w-4 h-4" style={{ color: "#f97316" }} />
            <span className="text-sm font-medium" style={{ color: "#f97316" }}>{tradeNames[trade]}</span>
          </div>

          {/* Scenario */}
          {currentQuestion.scenario && (
            <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <p className="text-sm italic" style={{ color: "#d97706" }}>
                <strong>Scenario:</strong> {currentQuestion.scenario}
              </p>
            </div>
          )}

          {/* Question */}
          <h3 className="text-lg font-semibold mb-6" style={{ color: "#fff" }}>
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all"
                  style={{
                    background: showCorrect ? "rgba(16,185,129,0.15)" : showWrong ? "rgba(239,68,68,0.15)" : isSelected ? "rgba(249,115,22,0.15)" : "#2a2a2a",
                    border: `1px solid ${showCorrect ? "#10b981" : showWrong ? "#ef4444" : isSelected ? "#f97316" : "#333"}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                    style={{
                      background: showCorrect ? "#10b981" : showWrong ? "#ef4444" : isSelected ? "#f97316" : "#333",
                      color: (showCorrect || showWrong || isSelected) ? "#000" : "#fff",
                    }}
                  >
                    {showCorrect ? <CheckCircle2 className="w-5 h-5" /> : showWrong ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ color: "#fff" }}>{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-xl"
                style={{ background: "#2a2a2a" }}
              >
                <p className="text-sm" style={{ color: "#9ca3af" }}>
                  <strong style={{ color: "#10b981" }}>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full mt-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#000" }}
            >
              {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Score Preview */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Current Score: <span style={{ color: "#10b981" }}>{score}</span> / {currentIndex + (showResult ? 1 : 0)}
        </p>
      </div>
    </motion.div>
  );
}
