'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Trophy,
  ClipboardList,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Crown,
  Clock,
  Target,
  Dumbbell,
  Users,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

interface UserStats {
  coachLogicSubscribed: boolean;
  coachLogicPlans: number;
  coachLogicFreePlanUsed: boolean;
  coachLogicSubExpiresAt: string | null;
}

interface DrillSection {
  name: string;
  duration: number;
  description: string;
  keyPoints: string[];
}

interface PracticePlan {
  sport: string;
  duration: number;
  focusAreas: string[];
  warmup: DrillSection;
  mainDrills: DrillSection[];
  scrimmage: DrillSection;
  cooldown: DrillSection;
  coachNotes: string[];
}

const SPORTS = [
  'Basketball', 'Soccer', 'Football', 'Baseball', 'Volleyball',
  'Hockey', 'Tennis', 'Swimming', 'Track & Field', 'Wrestling',
  'Lacrosse', 'Softball', 'Rugby', 'Golf', 'Gymnastics'
];

export function CoachLogicClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [sport, setSport] = useState('');
  const [opponentNotes, setOpponentNotes] = useState('');
  const [practiceGoals, setPracticeGoals] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<PracticePlan | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/coachlogic/stats');
      const data = await res.json();
      setUserStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch('/api/coachlogic/subscribe', { method: 'POST' });
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

  async function handleGenerate() {
    if (!sport || !opponentNotes.trim()) {
      setError('Please select a sport and enter opponent notes');
      return;
    }

    if (userStats && !userStats.coachLogicSubscribed && userStats.coachLogicFreePlanUsed) {
      setError('Free plan used. Please subscribe for unlimited plans.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/coachlogic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport, opponentNotes, practiceGoals, duration }),
      });

      if (res.status === 402) {
        setError('Free plan used. Please subscribe to continue.');
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
    } catch (e) {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function DrillCard({ drill, index }: { drill: DrillSection; index?: number }) {
    return (
      <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white flex items-center gap-2">
            {index !== undefined && (
              <span className="w-6 h-6 rounded-full bg-orange-500/30 text-orange-400 text-sm flex items-center justify-center">
                {index + 1}
              </span>
            )}
            {drill.name}
          </h4>
          <span className="text-sm text-orange-400 flex items-center gap-1">
            <Clock className="w-4 h-4" /> {drill.duration} min
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-3">{drill.description}</p>
        {drill.keyPoints.length > 0 && (
          <ul className="space-y-1">
            {drill.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <Target className="w-3 h-3 text-orange-400 mt-1" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CoachLogic</h1>
            <p className="text-gray-400">AI-Powered Practice Plan Generator</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {userStats && !userStats.coachLogicSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-orange-400" />
              <div>
                <p className="text-white font-medium">
                  {userStats.coachLogicFreePlanUsed ? 'Subscribe for Unlimited Plans' : '1 Free Plan Available!'}
                </p>
                <p className="text-gray-400 text-sm">Generate custom practice plans for any sport</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Subscribe $15/mo
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
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <ClipboardList className="w-4 h-4" />
              <span className="text-sm">Plans Generated</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.coachLogicPlans}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Status</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.coachLogicSubscribed ? 'Pro Active' : userStats.coachLogicFreePlanUsed ? 'Free Used' : '1 Free Plan'}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)]"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            Practice Details
          </h3>

          {/* Sport Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Sport</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="">Select a sport...</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Practice Duration</label>
            <div className="flex gap-2">
              {[45, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg border transition-colors ${
                    duration === d
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'border-[var(--color-border)] text-gray-400 hover:border-orange-500/50'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Opponent Notes */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Opponent Notes / Scouting Report</label>
            <textarea
              value={opponentNotes}
              onChange={(e) => setOpponentNotes(e.target.value)}
              placeholder="Example: Fast guards, weak on left side defense, full-court press after scores, tall center dominates rebounds..."
              className="w-full h-32 p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Practice Goals */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Practice Goals (optional)</label>
            <textarea
              value={practiceGoals}
              onChange={(e) => setPracticeGoals(e.target.value)}
              placeholder="Example: Improve ball handling, work on zone defense, increase team communication..."
              className="w-full h-20 p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !sport || !opponentNotes.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Plan...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate Practice Plan</>
            )}
          </button>

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
              {/* Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">{result.sport} Practice Plan</h2>
                  <span className="text-orange-400 flex items-center gap-1">
                    <Clock className="w-5 h-5" /> {result.duration} min
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.focusAreas.map((area) => (
                    <span key={area} className="px-3 py-1 rounded-full bg-orange-500/30 text-orange-300 text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Warmup */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-yellow-400" /> Warm-Up
                </h3>
                <DrillCard drill={result.warmup} />
              </div>

              {/* Main Drills */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" /> Main Drills
                </h3>
                <div className="space-y-3">
                  {result.mainDrills.map((drill, i) => (
                    <DrillCard key={i} drill={drill} index={i} />
                  ))}
                </div>
              </div>

              {/* Scrimmage */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" /> Scrimmage
                </h3>
                <DrillCard drill={result.scrimmage} />
              </div>

              {/* Cool Down */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-400" /> Cool Down
                </h3>
                <DrillCard drill={result.cooldown} />
              </div>

              {/* Coach Notes */}
              {result.coachNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Coach Notes</h3>
                  <ul className="space-y-1">
                    {result.coachNotes.map((note, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="w-full py-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white hover:bg-[var(--color-border)] transition-colors"
              >
                Create New Plan
              </button>
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col items-center justify-center text-center p-6">
              <Trophy className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Your Practice Plan Will Appear Here</h3>
              <p className="text-gray-500">Enter opponent notes and generate a customized practice plan</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
