"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Music, Wand2, Play, Pause, Download, Loader2, CreditCard, Sparkles,
  Clock, Volume2, Zap, Bitcoin, RefreshCw, Square
} from "lucide-react";

interface GeneratedTrack {
  audioUrl: string;
  genre: string;
  mood: string;
  duration: number;
  tempo: number;
  title: string;
  description: string;
}

interface UserStats {
  soundForgeSubscribed: boolean;
  soundForgeTracks: number;
  soundForgeFreeUsed: boolean;
  soundForgeSubExpiresAt: string | null;
}

const GENRES = [
  { id: "ambient", name: "Ambient", icon: "🌊" },
  { id: "electronic", name: "Electronic", icon: "🎹" },
  { id: "hiphop", name: "Hip-Hop", icon: "🎤" },
  { id: "rock", name: "Rock", icon: "🎸" },
  { id: "jazz", name: "Jazz", icon: "🎷" },
  { id: "classical", name: "Classical", icon: "🎻" },
  { id: "lofi", name: "Lo-Fi", icon: "☕" },
  { id: "cinematic", name: "Cinematic", icon: "🎬" },
];

const MOODS = [
  { id: "energetic", name: "Energetic", color: "#f97316" },
  { id: "calm", name: "Calm", color: "#3b82f6" },
  { id: "dark", name: "Dark", color: "#6b21a8" },
  { id: "uplifting", name: "Uplifting", color: "#22c55e" },
  { id: "melancholic", name: "Melancholic", color: "#64748b" },
  { id: "mysterious", name: "Mysterious", color: "#7c3aed" },
  { id: "romantic", name: "Romantic", color: "#ec4899" },
  { id: "epic", name: "Epic", color: "#eab308" },
];

const DURATIONS = [15, 30, 60, 90, 120];

export default function SoundForgeClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null);
  
  // Form state
  const [selectedGenre, setSelectedGenre] = useState("ambient");
  const [selectedMood, setSelectedMood] = useState("calm");
  const [duration, setDuration] = useState(30);
  const [prompt, setPrompt] = useState("");
  
  // Audio player
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/soundforge/stats");
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
      const endpoint = method === "crypto" ? "/api/crypto/checkout" : "/api/soundforge/subscribe";
      const body = method === "crypto" 
        ? JSON.stringify({ productType: "soundforge_subscription", returnPath: "/soundforge" })
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
    if (!userStats?.soundForgeSubscribed && userStats?.soundForgeFreeUsed) {
      setError("Please subscribe to generate more tracks");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedTrack(null);

    try {
      const res = await fetch("/api/soundforge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: selectedGenre,
          mood: selectedMood,
          duration,
          prompt: prompt.trim(),
        }),
      });

      if (res.status === 402) {
        setError("Please subscribe to generate more tracks");
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to generate track");
      }

      const data = await res.json();
      setGeneratedTrack(data);
      fetchStats();
    } catch (err) {
      setError("Failed to generate track. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !generatedTrack?.audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = async () => {
    if (!generatedTrack?.audioUrl) return;
    
    const a = document.createElement("a");
    a.href = generatedTrack.audioUrl;
    a.download = `soundforge-${selectedGenre}-${selectedMood}.mp3`;
    a.click();
  };

  const canGenerate = userStats?.soundForgeSubscribed || !userStats?.soundForgeFreeUsed;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}>
            <Music className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SoundForge</h1>
            <p className="text-gray-400">AI Music & Audio Generator</p>
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
              <Volume2 className="w-4 h-4" />
              <span>Tracks Created</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.soundForgeTracks}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Status</span>
            </div>
            <p className={`text-lg font-semibold ${userStats.soundForgeSubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.soundForgeSubscribed ? "Pro" : canGenerate ? "Free Trial" : "Upgrade Required"}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span>Expires</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {userStats.soundForgeSubExpiresAt 
                ? new Date(userStats.soundForgeSubExpiresAt).toLocaleDateString() 
                : "—"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Subscription Banner */}
      {userStats && !userStats.soundForgeSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl mb-8"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(168,85,247,0.1) 100%)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Upgrade to SoundForge Pro</h3>
              <p className="text-gray-400">
                {userStats.soundForgeFreeUsed 
                  ? "You've used your free track. Subscribe for unlimited AI music generation!"
                  : "Generate 1 free track, then subscribe for unlimited access"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSubscribe("card")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                $20/month
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
            <Wand2 className="w-5 h-5 text-purple-400" />
            Create Your Track
          </h2>

          {/* Genre Selection */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Genre</label>
            <div className="grid grid-cols-4 gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`p-3 rounded-xl text-center transition-all ${selectedGenre === genre.id ? "ring-2 ring-purple-500" : ""}`}
                  style={{ 
                    background: selectedGenre === genre.id ? "rgba(124,58,237,0.3)" : "var(--bg-tertiary)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <span className="text-2xl">{genre.icon}</span>
                  <p className="text-xs text-gray-300 mt-1">{genre.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Mood</label>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-3 rounded-xl text-center transition-all ${selectedMood === mood.id ? "ring-2" : ""}`}
                  style={{ 
                    background: selectedMood === mood.id ? `${mood.color}30` : "var(--bg-tertiary)",
                    border: selectedMood === mood.id ? `2px solid ${mood.color}` : "1px solid var(--border)"
                  }}
                >
                  <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: mood.color }} />
                  <p className="text-xs text-gray-300">{mood.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Duration (seconds)</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${duration === d ? "text-white" : "text-gray-400"}`}
                  style={{ 
                    background: duration === d ? "rgba(124,58,237,0.3)" : "var(--bg-tertiary)",
                    border: duration === d ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)"
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Describe Your Track (Optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A peaceful morning sunrise with soft piano and birds chirping..."
              className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !canGenerate}
            className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-5 h-5" /> Generate Track</>
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
            <Volume2 className="w-5 h-5 text-purple-400" />
            Generated Track
          </h2>

          {generating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                <Music className="w-10 h-10 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-400 mt-6">Creating your masterpiece...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
            </div>
          ) : generatedTrack ? (
            <div>
              {/* Track Info */}
              <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-tertiary)" }}>
                <h3 className="text-lg font-semibold text-white mb-2">{generatedTrack.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{generatedTrack.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Music className="w-4 h-4" /> {generatedTrack.genre}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> {generatedTrack.mood}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {generatedTrack.duration}s
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4" /> {generatedTrack.tempo} BPM
                  </span>
                </div>
              </div>

              {/* Audio Player */}
              <div className="p-6 rounded-xl mb-6" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(168,85,247,0.1) 100%)" }}>
                <audio
                  ref={audioRef}
                  src={generatedTrack.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <Download className="w-5 h-5" /> Download MP3
                </button>
                <button
                  onClick={() => { setGeneratedTrack(null); setPrompt(""); }}
                  className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
                >
                  <RefreshCw className="w-5 h-5" /> Create New
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-6 rounded-full mb-4" style={{ background: "var(--bg-tertiary)" }}>
                <Music className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-400">Configure your track settings and click generate</p>
              <p className="text-gray-500 text-sm mt-2">AI will create a unique track based on your preferences</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
