"use client";

import { useState, useEffect } from "react";

interface CaptchaProps {
  onVerified: (verified: boolean) => void;
}

export default function SimpleCaptcha({ onVerified }: CaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  useEffect(() => {
    const correct = parseInt(answer) === num1 + num2;
    setVerified(correct);
    onVerified(correct);
  }, [answer, num1, num2, onVerified]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {num1} + {num2} =
      </span>
      <input
        type="number"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-20 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
        placeholder="?"
      />
      {verified && <span className="text-green-400 text-sm">✓</span>}
      {/* Honeypot field - hidden from real users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      />
    </div>
  );
}
