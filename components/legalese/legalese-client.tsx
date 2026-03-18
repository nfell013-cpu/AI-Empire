"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, AlertTriangle, CheckCircle, DollarSign, X, Zap, Clock, RotateCcw, ArrowRight } from "lucide-react";
import AnalysisDisplay from "./analysis-display";

type AnalysisResult = {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  issues: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    title: string;
    description: string;
    clause?: string;
  }>;
  recommendations: string[];
};

type ScanStatus = "idle" | "uploading" | "analyzing" | "done" | "error" | "paywall";

export default function LegaleseClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [userStats, setUserStats] = useState<{ scanCount: number; freeScanUsed: boolean } | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => setUserStats(d))
      .catch(console.error);
  }, []);

  // Check for payment success
  useEffect(() => {
    const urlParams = new URLSearchParams(window?.location?.search ?? "");
    const sessionId = urlParams.get("session_id");
    const pendingFile = typeof window !== "undefined" ? sessionStorage.getItem("pendingFileName") : null;
    if (sessionId && pendingFile) {
      sessionStorage.removeItem("pendingFileName");
      // Payment successful, prompt user to re-upload
      setStatus("idle");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    } else {
      setError("Please upload a PDF file.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target?.files?.[0];
    if (picked?.type === "application/pdf") {
      setFile(picked);
      setError("");
    } else if (picked) {
      setError("Please upload a PDF file.");
    }
  };

  const handleScan = async () => {
    if (!file) return;

    // Check paywall
    if (userStats?.freeScanUsed) {
      setStatus("paywall");
      return;
    }

    setStatus("uploading");
    setProgress(10);
    setProgressMessage("Uploading document to secure storage...");
    setError("");

    try {
      // Step 1: Get presigned URL
      const presignRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: "application/pdf", isPublic: false }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, cloud_storage_path, signedHeaders } = await presignRes.json();

      setProgress(25);

      // Step 2: Upload to S3
      const uploadHeaders: Record<string, string> = { "Content-Type": "application/pdf" };
      if (signedHeaders?.includes("content-disposition")) {
        uploadHeaders["Content-Disposition"] = "attachment";
      }
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: uploadHeaders,
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file");

      setProgress(40);
      setStatus("analyzing");
      setProgressMessage("AI is scanning your contract...");

      // Step 3: Analyze with streaming
      const base64 = await fileToBase64(file);
      const analyzeRes = await fetch("/api/legalese/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud_storage_path, fileName: file.name, base64 }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");

      // Stream response
      const reader = analyzeRes.body?.getReader();
      const decoder = new TextDecoder();
      let partialRead = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split("\n");
        partialRead = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.status === "processing") {
                setProgress((prev) => Math.min(prev + 2, 90));
                if (parsed.message) setProgressMessage(parsed.message);
              } else if (parsed.status === "completed") {
                setResult(parsed.result);
                setProgress(100);
                setStatus("done");
                // Refresh user stats
                fetch("/api/user/stats").then((r) => r.json()).then((d) => setUserStats(d)).catch(console.error);
              } else if (parsed.status === "error") {
                throw new Error(parsed.message ?? "Analysis failed");
              }
            } catch (parseErr) {
              // Skip malformed JSON chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setStatus("error");
    }
  };

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handlePayment = async () => {
    if (!file) return;
    setLoadingCheckout(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingFileName", file.name);
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: "legalese_scan" }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setError("");
    setProgress(0);
    setProgressMessage("");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(99,102,241,0.15)" }}>
            <FileText className="w-6 h-6" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-bold text-gradient">Legalese</h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Upload a contract PDF and our AI will scan for auto-renewal traps, hidden fees, and risky clauses.
        </p>
        {userStats && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: userStats.freeScanUsed ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)", color: userStats.freeScanUsed ? "#f87171" : "var(--accent-light)" }}
          >
            <Zap className="w-3 h-3" />
            {userStats.freeScanUsed
              ? `${userStats.scanCount} scan${userStats.scanCount !== 1 ? "s" : ""} completed • $9.99/scan`
              : "1 free scan available"}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Upload Zone */}
        {(status === "idle" || status === "error") && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className="rounded-2xl border-2 border-dashed transition-all p-12 text-center cursor-pointer"
              style={{
                borderColor: dragOver ? "var(--accent)" : "var(--border)",
                background: dragOver ? "rgba(99,102,241,0.08)" : "var(--bg-card)",
              }}
              onClick={() => document.getElementById("pdf-input")?.click()}
            >
              <input
                id="pdf-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: dragOver ? "var(--accent)" : "var(--text-secondary)" }} />
              <p className="text-base font-semibold mb-2">
                {file ? file.name : "Drag & drop your contract PDF"}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB • Ready to scan` : "or click to browse • PDF files only"}
              </p>

              {file && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--accent-light)" }}>PDF selected</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1 rounded-full ml-1"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleScan}
                disabled={!file}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: file ? "var(--accent)" : "rgba(99,102,241,0.3)",
                  color: file ? "white" : "rgba(255,255,255,0.4)",
                  cursor: file ? "pointer" : "not-allowed",
                }}
              >
                <Zap className="w-4 h-4" />
                Scan Contract
              </button>
            </div>
          </motion.div>
        )}

        {/* Paywall */}
        {status === "paywall" && (
          <motion.div key="paywall" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-8 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
              <DollarSign className="w-8 h-8" style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2">Free Scan Used</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              You&apos;ve used your free scan. Each additional scan is just <strong style={{ color: "var(--text-primary)" }}>$9.99</strong>.
            </p>
            <div className="space-y-3 text-left max-w-xs mx-auto mb-6">
              {["AI-powered clause detection", "Auto-renewal trap alerts", "Hidden fee analysis", "Risk scoring & recommendations"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#10b981" }} />
                  <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handlePayment}
                disabled={loadingCheckout}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {loadingCheckout ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {loadingCheckout ? "Loading..." : "Pay $9.99 – Scan Now"}
              </button>
              <button onClick={reset} className="px-4 py-3 rounded-xl text-sm" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Uploading / Analyzing */}
        {(status === "uploading" || status === "analyzing") && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                <Clock className="w-5 h-5 animate-spin" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">{status === "uploading" ? "Uploading..." : "Analyzing Contract"}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{progressMessage || "Please wait..."}</p>
              </div>
            </div>

            <div className="w-full rounded-full h-2 mb-2" style={{ background: "var(--border)" }}>
              <motion.div
                className="h-2 rounded-full"
                style={{ background: "linear-gradient(90deg, var(--accent), #a78bfa)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-right" style={{ color: "var(--text-secondary)" }}>{progress}%</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {["Parsing clauses", "Detecting risks", "Generating report"].map((step, i) => (
                <div key={step} className="rounded-xl p-3 text-center text-xs" style={{ background: "var(--bg-secondary)", opacity: progress > i * 30 ? 1 : 0.3 }}>
                  <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ background: progress > i * 30 ? "var(--accent)" : "var(--border)" }} />
                  {step}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {status === "done" && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Scan Complete – {file?.name}</h2>
              <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                <RotateCcw className="w-3 h-3" /> New Scan
              </button>
            </div>
            <AnalysisDisplay result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
