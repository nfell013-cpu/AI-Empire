"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Smile, Wand2, Download, Loader2, CreditCard, Sparkles,
  Clock, Zap, Bitcoin, RefreshCw, Copy, Share2, TrendingUp, Image as ImageIcon
} from "lucide-react";
import Image from "next/image";

interface GeneratedMeme {
  imageUrl: string;
  topText: string;
  bottomText: string;
  template: string;
  viralScore: number;
  alternatives: string[];
}

interface UserStats {
  memeMintSubscribed: boolean;
  memeMintCreations: number;
  memeMintFreeUsed: boolean;
  memeMintSubExpiresAt: string | null;
}

const STYLES = [
  { id: "classic", name: "Classic", description: "Bold Impact font, white text" },
  { id: "modern", name: "Modern", description: "Clean sans-serif, minimal" },
  { id: "dark", name: "Dark", description: "Edgy, dramatic styling" },
  { id: "wholesome", name: "Wholesome", description: "Friendly, positive vibes" },
];

const TEMPLATES = [
  { id: "drake", name: "Drake Hotline", preview: "👇🤨 / 👆😏" },
  { id: "distracted", name: "Distracted BF", preview: "👀 👩 😠" },
  { id: "change_mind", name: "Change My Mind", preview: "☕ 🤔" },
  { id: "two_buttons", name: "Two Buttons", preview: "🟢 🔴 😰" },
  { id: "expanding_brain", name: "Expanding Brain", preview: "🧠 ➡️ 🧠✨" },
  { id: "disaster_girl", name: "Disaster Girl", preview: "🔥 😈" },
  { id: "custom", name: "Custom / AI Pick", preview: "✨ AI" },
];

export default function MemeMintClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedMeme, setGeneratedMeme] = useState<GeneratedMeme | null>(null);
  
  // Form state
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/mememint/stats");
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleSubscribe = async (method: "card" | "crypto") => {
    setLoading(true);
    try {
      const endpoint = method === "crypto" ? "/api/crypto/checkout" : "/api/mememint/subscribe";
      const body = method === "crypto" 
        ? JSON.stringify({ productType: "mememint_subscription", returnPath: "/mememint" })
        : undefined;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: method === "crypto" ? { "Content-Type": "application/json" } : {},
        body,
      });
      
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a meme idea or topic");
      return;
    }

    if (!userStats?.memeMintSubscribed && userStats?.memeMintFreeUsed) {
      setError("Please subscribe to create more memes");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedMeme(null);

    try {
      const res = await fetch("/api/mememint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          template: selectedTemplate,
          prompt: prompt.trim(),
        }),
      });

      if (res.status === 402) {
        setError("Please subscribe to create more memes");
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to generate meme");
      }

      const data = await res.json();
      setGeneratedMeme(data);
      fetchStats();
    } catch (err) {
      setError("Failed to generate meme. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedMeme?.imageUrl) return;
    
    const a = document.createElement("a");
    a.href = generatedMeme.imageUrl;
    a.download = `mememint-${Date.now()}.png`;
    a.click();
  };

  const handleCopyText = () => {
    if (!generatedMeme) return;
    const text = `${generatedMeme.topText}\n\n${generatedMeme.bottomText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate = userStats?.memeMintSubscribed || !userStats?.memeMintFreeUsed;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)" }}>
            <Smile className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">MemeMint</h1>
            <p className="text-gray-400">AI Meme Generator</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <ImageIcon className="w-4 h-4" />
              <span>Memes Created</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.memeMintCreations}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Status</span>
            </div>
            <p className={`text-lg font-semibold ${userStats.memeMintSubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.memeMintSubscribed ? "Pro" : canGenerate ? "Free Trial" : "Upgrade Required"}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span>Expires</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {userStats.memeMintSubExpiresAt 
                ? new Date(userStats.memeMintSubExpiresAt).toLocaleDateString() 
                : "—"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Subscription Banner */}
      {userStats && !userStats.memeMintSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl mb-8"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(251,191,36,0.1) 100%)", border: "1px solid rgba(249,115,22,0.3)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Upgrade to MemeMint Pro</h3>
              <p className="text-gray-400">
                {userStats.memeMintFreeUsed 
                  ? "You've used your free meme. Subscribe for unlimited meme generation!"
                  : "Generate 1 free meme, then subscribe for unlimited access"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSubscribe("card")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                $8/month
              </button>
              <button
                onClick={() => handleSubscribe("crypto")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #f7931a 0%, #ffb347 100%)" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bitcoin className="w-5 h-5" />}
                Pay with Crypto
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-orange-400" />
            Create Your Meme
          </h2>

          {/* Meme Idea */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Your Meme Idea *</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., When your code finally works after 6 hours of debugging..."
              className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
              rows={3}
            />
          </div>

          {/* Style Selection */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Style</label>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl text-left transition-all ${selectedStyle === style.id ? "ring-2 ring-orange-500" : ""}`}
                  style={{ 
                    background: selectedStyle === style.id ? "rgba(249,115,22,0.2)" : "var(--bg-tertiary)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <p className="text-white font-medium">{style.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Template (Optional)</label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-3 rounded-xl text-center transition-all ${selectedTemplate === template.id ? "ring-2 ring-orange-500" : ""}`}
                  style={{ 
                    background: selectedTemplate === template.id ? "rgba(249,115,22,0.2)" : "var(--bg-tertiary)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <span className="text-xl">{template.preview}</span>
                  <p className="text-xs text-gray-400 mt-1 truncate">{template.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !canGenerate || !prompt.trim()}
            className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)" }}
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-5 h-5" /> Generate Meme</>
            )}
          </button>

          {error && (
            <p className="mt-4 text-red-400 text-center">{error}</p>
          )}
        </motion.div>

        {/* Result Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-400" />
            Your Meme
          </h2>

          {generating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                <Smile className="w-10 h-10 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-400 mt-6">Cooking up your meme...</p>
              <p className="text-gray-500 text-sm mt-2">Adding the perfect amount of spice 🌶️</p>
            </div>
          ) : generatedMeme ? (
            <div>
              {/* Generated Meme Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-800">
                <Image
                  src={generatedMeme.imageUrl}
                  alt="Generated meme"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Viral Score */}
              <div className="p-4 rounded-xl mb-4" style={{ background: "var(--bg-tertiary)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Viral Score
                  </span>
                  <span className={`font-bold ${
                    generatedMeme.viralScore >= 80 ? "text-green-400" :
                    generatedMeme.viralScore >= 60 ? "text-yellow-400" : "text-orange-400"
                  }`}>
                    {generatedMeme.viralScore}/100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-700">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${generatedMeme.viralScore}%`,
                      background: generatedMeme.viralScore >= 80 ? "#22c55e" :
                                 generatedMeme.viralScore >= 60 ? "#eab308" : "#f97316"
                    }}
                  />
                </div>
              </div>

              {/* Meme Text */}
              <div className="p-4 rounded-xl mb-4" style={{ background: "var(--bg-tertiary)" }}>
                <p className="text-white font-bold mb-1">{generatedMeme.topText}</p>
                <p className="text-gray-400">{generatedMeme.bottomText}</p>
              </div>

              {/* Alternatives */}
              {generatedMeme.alternatives.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Alternative captions:</p>
                  <div className="space-y-2">
                    {generatedMeme.alternatives.map((alt, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg text-sm text-gray-300"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        {alt}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleDownload}
                  className="py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <Download className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={handleCopyText}
                  className="py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
                >
                  {copied ? "Copied!" : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
                <button
                  onClick={() => { setGeneratedMeme(null); setPrompt(""); }}
                  className="py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
                >
                  <RefreshCw className="w-4 h-4" /> New
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-6 rounded-full mb-4" style={{ background: "var(--bg-tertiary)" }}>
                <Smile className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-400">Enter your meme idea and click generate</p>
              <p className="text-gray-500 text-sm mt-2">AI will create the perfect meme for you</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
