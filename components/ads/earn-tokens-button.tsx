"use client";

import { useState } from "react";
import { Coins, Play } from "lucide-react";
import WatchAdModal from "./watch-ad-modal";

interface EarnTokensButtonProps {
  compact?: boolean;
  onTokensEarned?: (tokens: number) => void;
}

export default function EarnTokensButton({ compact, onTokensEarned }: EarnTokensButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 font-semibold text-white transition hover:opacity-90 ${
          compact ? 'px-3 py-2 rounded-lg text-xs' : 'px-4 py-3 rounded-xl text-sm w-full justify-center'
        }`}
        style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
      >
        <Play className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        <Coins className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {compact ? 'Free Tokens' : 'Watch Ad, Get Free Tokens'}
      </button>

      <WatchAdModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onTokensEarned={onTokensEarned}
      />
    </>
  );
}
