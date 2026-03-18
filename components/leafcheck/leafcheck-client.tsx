'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Upload,
  Loader2,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Sun,
  Thermometer,
  Crown,
  X,
  ImageIcon
} from 'lucide-react';

interface UserStats {
  leafCheckSubscribed: boolean;
  leafCheckScans: number;
  leafCheckFreeUsed: boolean;
  leafCheckSubExpiresAt: string | null;
}

interface PlantResult {
  plantName: string;
  scientificName: string;
  confidence: number;
  careGuide: {
    watering: string;
    sunlight: string;
    temperature: string;
    humidity: string;
    soil: string;
    fertilizing: string;
    commonIssues: string[];
    tips: string[];
  };
  funFacts: string[];
}

export function LeafCheckClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/leafcheck/stats');
      const data = await res.json();
      setUserStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch('/api/leafcheck/subscribe', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to subscribe:', e);
    } finally {
      setSubscribing(false);
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) handleFile(files[0]);
  }, []);

  function handleFile(selectedFile: File) {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError('');
  }

  async function handleAnalyze() {
    if (!file) return;

    // Check if user can scan
    if (userStats && !userStats.leafCheckSubscribed && userStats.leafCheckFreeUsed) {
      setError('Free scan used. Please subscribe for unlimited scans.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const res = await fetch('/api/leafcheck/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            fileName: file.name,
            contentType: file.type,
          }),
        });

        if (res.status === 402) {
          setError('Free scan used. Please subscribe to continue.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
          fetchStats();
        }
        setLoading(false);
      };
    } catch (e) {
      setError('Analysis failed. Please try again.');
      setLoading(false);
    }
  }

  function clearImage() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">LeafCheck</h1>
            <p className="text-gray-400">AI Plant Species Identification & Care Guide</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {userStats && !userStats.leafCheckSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-medium">
                  {userStats.leafCheckFreeUsed ? 'Subscribe for Unlimited Scans' : '1 Free Scan Available!'}
                </p>
                <p className="text-gray-400 text-sm">Identify any plant and get detailed care guides</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Subscribe $12/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Leaf className="w-4 h-4" />
              <span className="text-sm">Plants Identified</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.leafCheckScans}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Status</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.leafCheckSubscribed ? 'Pro Active' : userStats.leafCheckFreeUsed ? 'Free Used' : '1 Free Scan'}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative h-80 rounded-2xl border-2 border-dashed transition-all cursor-pointer
                ${dragActive ? 'border-green-500 bg-green-500/10' : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'}
                hover:border-green-500/50 hover:bg-green-500/5`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="p-4 rounded-full bg-green-500/20 mb-4">
                  <Camera className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Plant Photo</h3>
                <p className="text-gray-400 mb-4">Drag and drop or click to select</p>
                <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP</p>
              </div>
            </div>
          ) : (
            <div className="relative h-80 rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <img src={preview} alt="Plant preview" className="w-full h-full object-cover" />
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              {!result && (
                <div className="absolute bottom-4 left-4 right-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Identifying Plant...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Identify Plant</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {result ? (
            <div className="space-y-4">
              {/* Plant Name */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">Identified Plant</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{result.plantName}</h2>
                <p className="text-gray-400 italic">{result.scientificName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-400">Confidence:</span>
                  <div className="flex-1 h-2 bg-[var(--color-bg-tertiary)] rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm text-green-400 font-medium">{result.confidence}%</span>
                </div>
              </div>

              {/* Care Guide */}
              <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-white mb-4">Care Guide</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Droplets className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Watering</p>
                      <p className="text-white text-sm">{result.careGuide.watering}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sun className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Sunlight</p>
                      <p className="text-white text-sm">{result.careGuide.sunlight}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Thermometer className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Temperature</p>
                      <p className="text-white text-sm">{result.careGuide.temperature}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Soil</p>
                      <p className="text-white text-sm">{result.careGuide.soil}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              {result.careGuide.tips.length > 0 && (
                <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-white mb-3">Pro Tips</h3>
                  <ul className="space-y-2">
                    {result.careGuide.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={clearImage}
                className="w-full py-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white hover:bg-[var(--color-border)] transition-colors"
              >
                Identify Another Plant
              </button>
            </div>
          ) : (
            <div className="h-80 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col items-center justify-center text-center p-6">
              <Leaf className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Results Will Appear Here</h3>
              <p className="text-gray-500">Upload a plant photo to get identification and care guide</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
