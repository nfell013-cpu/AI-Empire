"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Calendar,
  MapPin,
  DollarSign,
  Compass,
  Sparkles,
  Loader2,
  CheckCircle,
  Star,
  Coffee,
  Camera,
  Utensils,
  Mountain,
  TreePine,
  Building,
  Plane,
} from "lucide-react";

interface UserStats {
  globeGuideSubscribed: boolean;
  globeGuideItineraries: number;
  globeGuideFreeUsed: boolean;
  globeGuideSubExpiresAt: string | null;
}

interface DayPlan {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    tips: string;
    cost: string;
  }[];
}

interface Itinerary {
  destination: string;
  duration: number;
  overview: string;
  bestTimeToVisit: string;
  estimatedBudget: { low: number; high: number };
  mustTryFood: string[];
  hiddenGems: string[];
  dailyPlans: DayPlan[];
  packingTips: string[];
  localPhrases: { phrase: string; meaning: string }[];
}

const INTERESTS = [
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "culture", label: "Culture", icon: Building },
  { id: "food", label: "Food & Dining", icon: Utensils },
  { id: "nature", label: "Nature", icon: TreePine },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "relaxation", label: "Relaxation", icon: Coffee },
];

const BUDGETS = [
  { id: "budget", label: "Budget", desc: "<$50/day" },
  { id: "moderate", label: "Moderate", desc: "$50-150/day" },
  { id: "comfort", label: "Comfort", desc: "$150-300/day" },
  { id: "luxury", label: "Luxury", desc: "$300+/day" },
];

export default function GlobeGuideClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState("moderate");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error" | "paywall">("idle");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/globeguide/stats");
    const data = await res.json();
    setUserStats(data);
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubscribe = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/globeguide/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Failed to start checkout");
    }
    setLoadingCheckout(false);
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      setError("Please enter a destination");
      return;
    }

    if (!userStats?.globeGuideSubscribed && userStats?.globeGuideFreeUsed) {
      setStatus("paywall");
      return;
    }

    setStatus("generating");
    setError("");
    setItinerary(null);

    try {
      const res = await fetch("/api/globeguide/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, duration, budget, interests }),
      });

      if (res.status === 402) {
        setStatus("paywall");
        return;
      }

      if (!res.ok) throw new Error("Failed to generate itinerary");

      const data = await res.json();
      setItinerary(data.itinerary);
      setStatus("done");
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">GlobeGuide</h1>
            <p className="text-gray-400">AI-Powered Travel Itinerary Generator</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {!userStats?.globeGuideSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-blue-400" />
              <span className="text-white">
                {userStats?.globeGuideFreeUsed
                  ? "Subscribe for unlimited AI itineraries"
                  : "Try your first itinerary free!"}
              </span>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star className="w-4 h-4" />
              )}
              Subscribe - $18/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${userStats.globeGuideSubscribed ? "text-green-400" : "text-yellow-400"}`}>
              {userStats.globeGuideSubscribed ? "Subscribed" : "Free Trial"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Itineraries Created</p>
            <p className="text-white font-semibold">{userStats.globeGuideItineraries}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Free Trial</p>
            <p className={`font-semibold ${userStats.globeGuideFreeUsed ? "text-gray-500" : "text-green-400"}`}>
              {userStats.globeGuideFreeUsed ? "Used" : "Available"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <p className="text-gray-400 text-sm">Expires</p>
            <p className="text-white font-semibold">
              {userStats.globeGuideSubExpiresAt
                ? new Date(userStats.globeGuideSubExpiresAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <AnimatePresence mode="wait">
        {status === "paywall" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center"
          >
            <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Itineraries</h2>
            <p className="text-gray-400 mb-6">
              Subscribe to GlobeGuide for $18/month and plan all your trips with AI.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {loadingCheckout ? "Loading..." : "Subscribe Now - $18/mo"}
            </button>
          </motion.div>
        ) : status === "done" && itinerary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Overview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
              <h2 className="text-2xl font-bold text-white mb-2">
                {itinerary.destination} - {itinerary.duration} Days
              </h2>
              <p className="text-gray-300 mb-4">{itinerary.overview}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Best Time</p>
                  <p className="text-white font-medium">{itinerary.bestTimeToVisit}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Budget Range</p>
                  <p className="text-green-400 font-medium">
                    ${itinerary.estimatedBudget.low} - ${itinerary.estimatedBudget.high}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Plans */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Daily Itinerary</h3>
              {itinerary.dailyPlans.map((day) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: day.day * 0.1 }}
                  className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                >
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">
                    Day {day.day}: {day.title}
                  </h4>
                  <div className="space-y-3">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                        <span className="text-cyan-400 font-mono text-sm whitespace-nowrap">
                          {activity.time}
                        </span>
                        <div>
                          <p className="text-white font-medium">{activity.activity}</p>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {activity.location}
                          </p>
                          {activity.tips && (
                            <p className="text-yellow-400/80 text-sm mt-1">💡 {activity.tips}</p>
                          )}
                        </div>
                        <span className="text-green-400 text-sm ml-auto">{activity.cost}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Hidden Gems & Tips */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" /> Hidden Gems
                </h4>
                <ul className="space-y-2">
                  {itinerary.hiddenGems.map((gem, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {gem}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" /> Must-Try Food
                </h4>
                <ul className="space-y-2">
                  {itinerary.mustTryFood.map((food, i) => (
                    <li key={i} className="text-gray-300">🍽️ {food}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setItinerary(null);
                setDestination("");
              }}
              className="w-full py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              Plan Another Trip
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Destination */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Tokyo, Japan or Paris, France"
                className="w-full p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Duration */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" /> Trip Duration
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-semibold w-20 text-center">
                  {duration} {duration === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" /> Budget Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUDGETS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBudget(b.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      budget === b.id
                        ? "border-blue-500 bg-blue-500/20 text-white"
                        : "border-[var(--color-border)] text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <p className="font-medium">{b.label}</p>
                    <p className="text-sm opacity-70">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" /> Travel Interests
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => {
                  const Icon = interest.icon;
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                        interests.includes(interest.id)
                          ? "border-cyan-500 bg-cyan-500/20 text-white"
                          : "border-[var(--color-border)] text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={status === "generating"}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Crafting Your Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Itinerary
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
