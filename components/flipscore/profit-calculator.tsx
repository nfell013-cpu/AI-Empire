"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calculator, DollarSign, Percent, TrendingUp, Package } from "lucide-react";

interface ProfitCalculatorProps {
  onClose: () => void;
  estimatedValue?: number;
}

export default function ProfitCalculator({ onClose, estimatedValue }: ProfitCalculatorProps) {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState(estimatedValue?.toString() || "");
  const [shippingCost, setShippingCost] = useState("");
  const [platformFee, setPlatformFee] = useState("13"); // eBay default ~13%
  const [paymentFee, setPaymentFee] = useState("2.9"); // PayPal/payment processor

  const [profit, setProfit] = useState<number | null>(null);
  const [roi, setRoi] = useState<number | null>(null);
  const [margin, setMargin] = useState<number | null>(null);

  useEffect(() => {
    if (estimatedValue && !sellingPrice) {
      setSellingPrice(estimatedValue.toString());
    }
  }, [estimatedValue, sellingPrice]);

  useEffect(() => {
    calculateProfit();
  }, [purchasePrice, sellingPrice, shippingCost, platformFee, paymentFee]);

  const calculateProfit = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const selling = parseFloat(sellingPrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const platFee = parseFloat(platformFee) || 0;
    const payFee = parseFloat(paymentFee) || 0;

    if (selling <= 0) {
      setProfit(null);
      setRoi(null);
      setMargin(null);
      return;
    }

    const platformFeeAmount = selling * (platFee / 100);
    const paymentFeeAmount = selling * (payFee / 100);
    const totalCosts = purchase + shipping + platformFeeAmount + paymentFeeAmount;
    const netProfit = selling - totalCosts;

    setProfit(netProfit);
    
    if (purchase > 0) {
      setRoi((netProfit / purchase) * 100);
    } else {
      setRoi(null);
    }
    
    setMargin((netProfit / selling) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" style={{ color: "#10b981" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Profit Calculator</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Purchase Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Selling Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Shipping Cost</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Platform Fee (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  placeholder="13"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Payment Fee (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="number"
                  value={paymentFee}
                  onChange={(e) => setPaymentFee(e.target.value)}
                  placeholder="2.9"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: profit !== null && profit >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Net Profit</p>
                <p className="text-lg font-bold" style={{ color: profit !== null && profit >= 0 ? "#10b981" : "#ef4444" }}>
                  ${profit !== null ? profit.toFixed(2) : "--"}
                </p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: roi !== null && roi >= 0 ? "rgba(99,102,241,0.1)" : "rgba(239,68,68,0.1)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>ROI</p>
                <p className="text-lg font-bold" style={{ color: roi !== null && roi >= 0 ? "var(--accent-light)" : "#ef4444" }}>
                  {roi !== null ? `${roi.toFixed(0)}%` : "--"}
                </p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: margin !== null && margin >= 0 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Margin</p>
                <p className="text-lg font-bold" style={{ color: margin !== null && margin >= 0 ? "#f59e0b" : "#ef4444" }}>
                  {margin !== null ? `${margin.toFixed(0)}%` : "--"}
                </p>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(99,102,241,0.1)" }}>
            <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent-light)" }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="font-medium" style={{ color: "var(--accent-light)" }}>Pro Tip:</span> Aim for at least 50% ROI on thrift finds to account for time and potential returns.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
