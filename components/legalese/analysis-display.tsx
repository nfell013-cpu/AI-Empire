"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle, TrendingUp, Lightbulb } from "lucide-react";

type Issue = {
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  clause?: string;
};

type AnalysisResult = {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  issues: Issue[];
  recommendations: string[];
};

const severityConfig = {
  high: { icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "High Risk" },
  medium: { icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Medium Risk" },
  low: { icon: Info, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Low Risk" },
};

const riskConfig = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "HIGH RISK" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "MEDIUM RISK" },
  low: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "LOW RISK" },
};

export default function AnalysisDisplay({ result }: { result: AnalysisResult }) {
  const risk = riskConfig[result.riskLevel ?? "low"];
  const highCount = result.issues?.filter((i) => i.severity === "high")?.length ?? 0;
  const medCount = result.issues?.filter((i) => i.severity === "medium")?.length ?? 0;
  const lowCount = result.issues?.filter((i) => i.severity === "low")?.length ?? 0;

  return (
    <div className="space-y-5">
      {/* Risk Score Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ background: risk.bg, border: `1px solid ${risk.color}44` }}
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6" style={{ color: risk.color }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: risk.color }}>{risk.label}</p>
            <p className="text-sm font-medium mt-0.5">{result.summary}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex gap-3">
            {highCount > 0 && <div className="text-center"><p className="text-lg font-bold" style={{ color: "#ef4444" }}>{highCount}</p><p className="text-xs" style={{ color: "var(--text-secondary)" }}>High</p></div>}
            {medCount > 0 && <div className="text-center"><p className="text-lg font-bold" style={{ color: "#f59e0b" }}>{medCount}</p><p className="text-xs" style={{ color: "var(--text-secondary)" }}>Medium</p></div>}
            {lowCount > 0 && <div className="text-center"><p className="text-lg font-bold" style={{ color: "#3b82f6" }}>{lowCount}</p><p className="text-xs" style={{ color: "var(--text-secondary)" }}>Low</p></div>}
          </div>
        </div>
      </motion.div>

      {/* Issues */}
      {(result.issues?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" style={{ color: "var(--accent)" }} />
            Detected Issues
          </h3>
          <div className="space-y-3">
            {result.issues?.map((issue, i) => {
              const cfg = severityConfig[issue.severity ?? "low"];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: cfg.bg }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{issue.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{issue.description}</p>
                      {issue.clause && (
                        <div className="mt-2 p-2.5 rounded-lg text-xs italic" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", borderLeft: `3px solid ${cfg.color}` }}>
                          &ldquo;{issue.clause}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {(result.recommendations?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: "#f59e0b" }} />
            Recommendations
          </h3>
          <div className="rounded-xl p-4 space-y-2.5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {result.recommendations?.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2.5"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
