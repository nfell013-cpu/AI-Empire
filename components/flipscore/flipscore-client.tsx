"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Upload, Camera, DollarSign, TrendingUp, Sparkles,
  CheckCircle2, AlertCircle, Loader2, X, Calculator, Tag, Package
} from "lucide-react";
import ProfitCalculator from "./profit-calculator";
import AnalysisResult from "./analysis-result";

interface UserStats {
  flipScoreSubscribed: boolean;
  flipScoreScans: number;
  flipScoreSubExpiresAt: string | null;
}

interface ScanResult {
  itemName: string;
  category: string;
  brand: string | null;
  condition: string;
  estimatedValue: { low: number; mid: number; high: number };
  demandLevel: string;
  sellTimeEstimate: string;
  tips: string[];
  comparables: { title: string; price: number; sold: boolean }[];
}

export default function FlipScoreClient() {
  const { data: session } = useSession() || {};
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "done" | "error" | "paywall">("idle");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await fetch("/api/flipscore/stats");
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch user stats", e);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
      setError(null);
      setStatus("idle");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
      setStatus("idle");
    }
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/flipscore/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create subscription checkout");
      }
    } catch (e) {
      setError("Failed to initiate subscription");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    // Check subscription
    if (!userStats?.flipScoreSubscribed) {
      setStatus("paywall");
      return;
    }

    setStatus("uploading");
    setProgress(10);
    setProgressMessage("Preparing image...");
    setError(null);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(file);
      
      setProgress(30);
      setProgressMessage("Analyzing item with AI Vision...");
      setStatus("analyzing");

      // Call analysis API
      const analyzeRes = await fetch("/api/flipscore/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      setProgress(70);
      setProgressMessage("Processing eBay market data...");

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const analysisData = await analyzeRes.json();
      setProgress(100);
      setProgressMessage("Analysis complete!");
      setResult(analysisData);
      setStatus("done");
      fetchUserStats(); // Refresh stats
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setStatus("error");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const resetScan = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    setProgress(0);
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
              <ShoppingBag className="w-6 h-6" style={{ color: "#10b981" }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              FlipScore
            </h1>
          </div>
          <p className="text-gray-400">
            Upload a photo of any thrift item and get instant eBay resale estimates
          </p>
        </motion.div>

        {/* Subscription Banner */}
        {userStats && !userStats.flipScoreSubscribed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" style={{ color: "#10b981" }} />
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Unlock Unlimited Scans</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Subscribe for $19/month to scan unlimited thrift items</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
              style={{ background: "#10b981", color: "white" }}
            >
              {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Subscribe Now
            </button>
          </motion.div>
        )}

        {/* Stats Bar */}
        {userStats?.flipScoreSubscribed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl flex items-center justify-between"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: "#10b981" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Subscribed</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{userStats.flipScoreScans} scans used</span>
              </div>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all"
              style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-light)" }}
            >
              <Calculator className="w-4 h-4" />
              Profit Calculator
            </button>
          </motion.div>
        )}

        {/* Profit Calculator Modal */}
        <AnimatePresence>
          {showCalculator && (
            <ProfitCalculator onClose={() => setShowCalculator(false)} estimatedValue={result?.estimatedValue?.mid} />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <Camera className="w-5 h-5" style={{ color: "#10b981" }} />
              Upload Item Photo
            </h2>

            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer hover:border-emerald-500/50 border-gray-600"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <Upload className="w-8 h-8" style={{ color: "#10b981" }} />
                </div>
                <p className="font-medium mb-1 text-white">Drop your image here</p>
                <p className="text-sm text-gray-400">or click to browse</p>
                <p className="text-xs mt-3 text-gray-400">Supports JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-xl"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                />
                <button
                  onClick={resetScan}
                  className="absolute top-2 right-2 p-1.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <X className="w-4 h-4" style={{ color: "white" }} />
                </button>

                {status === "idle" && (
                  <button
                    onClick={handleAnalyze}
                    className="w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze Item
                  </button>
                )}

                {(status === "uploading" || status === "analyzing") && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{progressMessage}</span>
                      <span className="text-sm font-medium" style={{ color: "#10b981" }}>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #10b981, #059669)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Results Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" style={{ color: "#10b981" }} />
              Resale Analysis
            </h2>

            {status === "idle" && !result && (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
                <Tag className="w-12 h-12 mb-3 opacity-30" />
                <p>Upload an item photo to see</p>
                <p>eBay resale estimates</p>
              </div>
            )}

            {status === "paywall" && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full mb-4" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <DollarSign className="w-8 h-8" style={{ color: "#10b981" }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Subscribe to Scan</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Get unlimited item scans for $19/month</p>
                <button
                  onClick={handleSubscribe}
                  disabled={loadingCheckout}
                  className="px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}
                >
                  {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Subscribe Now
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 mb-3" style={{ color: "#ef4444" }} />
                <p className="font-medium" style={{ color: "#ef4444" }}>{error || "Analysis failed"}</p>
                <button onClick={resetScan} className="mt-4 text-sm underline" style={{ color: "var(--accent-light)" }}>
                  Try again
                </button>
              </div>
            )}

            {(status === "uploading" || status === "analyzing") && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 mb-3 animate-spin" style={{ color: "#10b981" }} />
                <p style={{ color: "var(--text-secondary)" }}>{progressMessage}</p>
              </div>
            )}

            {status === "done" && result && (
              <AnalysisResult result={result} onOpenCalculator={() => setShowCalculator(true)} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
