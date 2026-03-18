"use client";

import { motion } from "framer-motion";
import { Tag, TrendingUp, Clock, DollarSign, Calculator, Star, ShoppingCart, AlertTriangle } from "lucide-react";

interface Comparable {
  title: string;
  price: number;
  sold: boolean;
}

interface EstimatedValue {
  low: number;
  mid: number;
  high: number;
}

interface ScanResult {
  itemName: string;
  category: string;
  brand: string | null;
  condition: string;
  estimatedValue: EstimatedValue;
  demandLevel: string;
  sellTimeEstimate: string;
  tips: string[];
  comparables: Comparable[];
}

interface AnalysisResultProps {
  result: ScanResult;
  onOpenCalculator: () => void;
}

export default function AnalysisResult({ result, onOpenCalculator }: AnalysisResultProps) {
  const demandColors: Record<string, string> = {
    high: "#10b981",
    medium: "#f59e0b",
    low: "#ef4444",
  };

  const demandColor = demandColors[result.demandLevel?.toLowerCase()] || "var(--text-secondary)";

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {/* Item Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{result.itemName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent-light)" }}>
                {result.category}
              </span>
              {result.brand && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>
                  {result.brand}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Condition</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{result.condition}</p>
          </div>
        </div>
      </motion.div>

      {/* Price Estimate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>eBay Resale Estimate</span>
          </div>
          <button
            onClick={onOpenCalculator}
            className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
            style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent-light)" }}
          >
            <Calculator className="w-3 h-3" />
            Calculate
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Low</p>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>${result.estimatedValue.low}</p>
          </div>
          <div className="border-x" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Average</p>
            <p className="text-2xl font-bold" style={{ color: "#10b981" }}>${result.estimatedValue.mid}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>High</p>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>${result.estimatedValue.high}</p>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-primary)" }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: demandColor }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Demand</span>
          </div>
          <p className="font-semibold capitalize" style={{ color: demandColor }}>{result.demandLevel}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--bg-primary)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Sell Time</span>
          </div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{result.sellTimeEstimate}</p>
        </div>
      </motion.div>

      {/* Comparables */}
      {result.comparables && result.comparables.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl"
          style={{ background: "var(--bg-primary)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Similar Listings</span>
          </div>
          <div className="space-y-2">
            {result.comparables.slice(0, 3).map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2" style={{ color: "var(--text-secondary)" }}>{comp.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>${comp.price}</span>
                  {comp.sold && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>SOLD</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips */}
      {result.tips && result.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl"
          style={{ background: "rgba(245,158,11,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <span className="font-medium text-sm" style={{ color: "#f59e0b" }}>Selling Tips</span>
          </div>
          <ul className="space-y-1">
            {result.tips.map((tip, idx) => (
              <li key={idx} className="text-xs flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                <span style={{ color: "#f59e0b" }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
