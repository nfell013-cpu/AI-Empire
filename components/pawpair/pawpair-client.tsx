'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PawPrint,
  Heart,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Crown,
  CheckCircle2,
  Home,
  Clock,
  DollarSign,
  Activity,
  Users,
  Leaf
} from 'lucide-react';

interface UserStats {
  pawPairPurchased: boolean;
  pawPairQuizzes: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}

interface PetMatch {
  name: string;
  matchPercent: number;
  traits: string[];
  whyMatch: string;
  considerations: string[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'living',
    question: 'What type of home do you live in?',
    options: [
      { value: 'apartment', label: 'Apartment/Condo' },
      { value: 'house_small', label: 'Small House' },
      { value: 'house_large', label: 'Large House with Yard' },
      { value: 'rural', label: 'Rural Property/Farm' },
    ],
  },
  {
    id: 'activity',
    question: 'How would you describe your activity level?',
    options: [
      { value: 'sedentary', label: 'Sedentary (mostly indoors)' },
      { value: 'moderate', label: 'Moderate (daily walks)' },
      { value: 'active', label: 'Active (hiking, running)' },
      { value: 'very_active', label: 'Very Active (athlete/outdoor enthusiast)' },
    ],
  },
  {
    id: 'time',
    question: 'How much time can you dedicate to a pet daily?',
    options: [
      { value: 'minimal', label: 'Less than 1 hour' },
      { value: 'some', label: '1-2 hours' },
      { value: 'moderate', label: '2-4 hours' },
      { value: 'lots', label: '4+ hours' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your monthly pet budget?',
    options: [
      { value: 'low', label: 'Under $50' },
      { value: 'medium', label: '$50-$150' },
      { value: 'high', label: '$150-$300' },
      { value: 'unlimited', label: '$300+' },
    ],
  },
  {
    id: 'household',
    question: 'Who lives in your household?',
    options: [
      { value: 'single', label: 'Just me' },
      { value: 'couple', label: 'With partner' },
      { value: 'family_older', label: 'Family with older kids (12+)' },
      { value: 'family_young', label: 'Family with young kids' },
    ],
  },
  {
    id: 'allergies',
    question: 'Any pet allergies in your household?',
    options: [
      { value: 'none', label: 'No allergies' },
      { value: 'mild', label: 'Mild allergies' },
      { value: 'severe', label: 'Severe allergies (need hypoallergenic)' },
    ],
  },
  {
    id: 'experience',
    question: 'What\'s your pet ownership experience?',
    options: [
      { value: 'none', label: 'First-time owner' },
      { value: 'some', label: 'Had pets growing up' },
      { value: 'experienced', label: 'Experienced pet owner' },
      { value: 'expert', label: 'Professional/breeder level' },
    ],
  },
  {
    id: 'preference',
    question: 'What type of pet interests you most?',
    options: [
      { value: 'dog', label: 'Dog' },
      { value: 'cat', label: 'Cat' },
      { value: 'small', label: 'Small pet (hamster, rabbit, etc.)' },
      { value: 'any', label: 'Open to any!' },
    ],
  },
];

export function PawPairClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'loading' | 'results'>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<PetMatch[] | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/pawpair/stats');
      const data = await res.json();
      setUserStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const res = await fetch('/api/pawpair/purchase', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to purchase:', e);
    } finally {
      setPurchasing(false);
    }
  }

  function handleAnswer(value: string) {
    const question = QUIZ_QUESTIONS[questionIndex];
    setAnswers({ ...answers, [question.id]: value });

    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      submitQuiz();
    }
  }

  async function submitQuiz() {
    setCurrentStep('loading');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pawpair/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (res.status === 402) {
        setError('Please purchase PawPair to see your results.');
        setCurrentStep('intro');
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setCurrentStep('intro');
      } else {
        setResults(data.matches);
        setCurrentStep('results');
        fetchStats();
      }
    } catch (e) {
      setError('Analysis failed. Please try again.');
      setCurrentStep('intro');
    } finally {
      setLoading(false);
    }
  }

  function startQuiz() {
    setCurrentStep('quiz');
    setQuestionIndex(0);
    setAnswers({});
    setResults(null);
  }

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const progress = ((questionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">PawPair</h1>
            <p className="text-gray-400">Find Your Perfect Pet Match</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Intro Screen */}
        {currentStep === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            {/* Purchase Banner if not purchased */}
            {userStats && !userStats.pawPairPurchased && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-pink-400" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Unlock Your Perfect Match</h2>
                    <p className="text-gray-400">One-time purchase, unlimited quizzes forever</p>
                  </div>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {purchasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                  Get PawPair - $14 One-Time
                </button>
              </div>
            )}

            {/* How it works */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <Home className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Answer Lifestyle Questions</p>
                    <p className="text-gray-400 text-sm">Tell us about your home, schedule, and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <Activity className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">AI Analyzes Compatibility</p>
                    <p className="text-gray-400 text-sm">Our AI matches your lifestyle to pet breeds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Get Your Matches</p>
                    <p className="text-gray-400 text-sm">Receive detailed compatibility reports for top matches</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {userStats && userStats.pawPairPurchased && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>PawPair Unlocked</span>
                  </div>
                  <span className="text-gray-400">{userStats.pawPairQuizzes} quizzes taken</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 mb-6">
                {error}
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={!userStats?.pawPairPurchased}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PawPrint className="w-6 h-6" />
              {userStats?.pawPairPurchased ? 'Start Quiz' : 'Purchase to Start Quiz'}
            </button>
          </motion.div>
        )}

        {/* Quiz Screen */}
        {currentStep === 'quiz' && currentQuestion && (
          <motion.div
            key={`quiz-${questionIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl mx-auto"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Question {questionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                <span className="text-pink-400 text-sm">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h2 className="text-2xl font-semibold text-white mb-6">{currentQuestion.question}</h2>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-left text-white hover:border-pink-500/50 hover:bg-pink-500/10 transition-all flex items-center justify-between group"
                  >
                    <span>{option.label}</span>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Back Button */}
            {questionIndex > 0 && (
              <button
                onClick={() => setQuestionIndex(questionIndex - 1)}
                className="mt-4 px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </motion.div>
        )}

        {/* Loading Screen */}
        {currentStep === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto text-center py-20"
          >
            <div className="p-6 rounded-full bg-pink-500/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-pink-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Finding Your Perfect Match...</h2>
            <p className="text-gray-400">Our AI is analyzing your lifestyle</p>
          </motion.div>
        )}

        {/* Results Screen */}
        {currentStep === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Pet Matches!</h2>
              <p className="text-gray-400">Based on your lifestyle and preferences</p>
            </div>

            <div className="space-y-6">
              {results.map((match, index) => (
                <motion.div
                  key={match.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border ${
                    index === 0
                      ? 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/30'
                      : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-pink-500/30 text-pink-300 text-xs font-medium mb-2">
                          <Heart className="w-3 h-3" /> Top Match
                        </span>
                      )}
                      <h3 className="text-2xl font-bold text-white">{match.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-pink-400">{match.matchPercent}%</div>
                      <div className="text-sm text-gray-400">match</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-3 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-gray-300 text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-300 mb-4">{match.whyMatch}</p>

                  {match.considerations.length > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                      <p className="text-sm text-gray-400 mb-2">Things to Consider:</p>
                      <ul className="space-y-1">
                        {match.considerations.map((c, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              onClick={startQuiz}
              className="w-full mt-8 py-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-border)] transition-colors"
            >
              Take Quiz Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
