'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Eye,
  Upload,
  Loader2,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Crown,
  X,
  History,
  DollarSign,
  Tag,
  Calendar,
  Info
} from 'lucide-react';

interface UserStats {
  visionLensSubscribed: boolean;
  visionLensScans: number;
  visionLensFreeUsed: boolean;
  visionLensSubExpiresAt: string | null;
}

interface ObjectResult {
  objectName: string;
  category: string;
  era: string;
  origin: string;
  estimatedValue: { low: number; mid: number; high: number };
  history: string;
  materials: string[];
  condition: string;
  rarity: string;
  funFacts: string[];
  tips: string[];
}

export function VisionLensClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<ObjectResult | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/visionlens/stats');
      const data = await res.json();
      setUserStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch('/api/visionlens/subscribe', { method: 'POST' });
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

    if (userStats && !userStats.visionLensSubscribed && userStats.visionLensFreeUsed) {
      setError('Free scan used. Please subscribe for unlimited scans.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const res = await fetch('/api/visionlens/analyze', {
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

  const rarityColors: Record<string, string> = {
    'Common': 'text-gray-400',
    'Uncommon': 'text-green-400',
    'Rare': 'text-blue-400',
    'Very Rare': 'text-purple-400',
    'Extremely Rare': 'text-yellow-400',
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">VisionLens</h1>
            <p className="text-gray-400">Object Identification, History & Value Estimation</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {userStats && !userStats.visionLensSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-white font-medium">
                  {userStats.visionLensFreeUsed ? 'Subscribe for Unlimited Scans' : '1 Free Scan Available!'}
                </p>
                <p className="text-gray-400 text-sm">Identify any object, discover its history and value</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Subscribe $10/mo
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
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Objects Analyzed</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.visionLensScans}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Status</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.visionLensSubscribed ? 'Pro Active' : userStats.visionLensFreeUsed ? 'Free Used' : '1 Free Scan'}
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
                ${dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'}
                hover:border-cyan-500/50 hover:bg-cyan-500/5`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="p-4 rounded-full bg-cyan-500/20 mb-4">
                  <Camera className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Object Photo</h3>
                <p className="text-gray-400 mb-4">Antiques, collectibles, art, or any object</p>
                <p className="text-sm text-gray-500">Drag and drop or click to select</p>
              </div>
            </div>
          ) : (
            <div className="relative h-80 rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <img src={preview} alt="Object preview" className="w-full h-full object-cover" />
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Identify Object</>
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
              {/* Object Name & Category */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-cyan-400">{result.category}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{result.objectName}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {result.era}
                  </span>
                  <span className={`${rarityColors[result.rarity] || 'text-gray-400'}`}>
                    {result.rarity}
                  </span>
                </div>
              </div>

              {/* Value Estimate */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-semibold text-white">Estimated Value</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Low</p>
                    <p className="text-xl font-bold text-gray-300">${result.estimatedValue.low}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-400">Average</p>
                    <p className="text-3xl font-bold text-green-400">${result.estimatedValue.mid}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">High</p>
                    <p className="text-xl font-bold text-gray-300">${result.estimatedValue.high}</p>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-semibold text-white">History & Background</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.history}</p>
              </div>

              {/* Materials & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <p className="text-sm text-gray-400 mb-2">Materials</p>
                  <div className="flex flex-wrap gap-1">
                    {result.materials.map((m) => (
                      <span key={m} className="px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-xs text-gray-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <p className="text-sm text-gray-400 mb-2">Condition</p>
                  <p className="text-white font-medium">{result.condition}</p>
                </div>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                    <Info className="w-4 h-4" /> Tips
                  </p>
                  <ul className="space-y-1">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
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
                Analyze Another Object
              </button>
            </div>
          ) : (
            <div className="h-80 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col items-center justify-center text-center p-6">
              <Eye className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Results Will Appear Here</h3>
              <p className="text-gray-500">Upload a photo of any object to identify it and learn its history & value</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
