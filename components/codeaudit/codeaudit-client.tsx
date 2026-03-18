"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, Copy, CheckCircle, Zap, AlertCircle } from "lucide-react";

export default function CodeAuditClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const res = await fetch("/api/codeaudit/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }
      
      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl" style={{ background: "#6366f120" }}>
          <Code2 className="w-8 h-8" style={{ color: "#6366f1" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>CodeAudit</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>AI code review & security vulnerability scanner</p>
        </div>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Paste your code
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste code to audit for security vulnerabilities, bugs, and best practices..."
          className="w-full h-40 p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
          style={{
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="mt-4 px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#6366f1" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Zap className="w-4 h-4" /> Audit Code</>
          )}
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Results</h2>
            <button
              onClick={copyResult}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {copied ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <div className="rounded-xl p-4 overflow-auto max-h-[500px]" style={{ background: "var(--bg-primary)" }}>
            <pre className="text-xs whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
              {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}
