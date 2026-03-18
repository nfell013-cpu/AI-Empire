// Enhancement #6: Dark Mode Toggle with Persistence
"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// This app is already "dark" by default. This toggle switches between dark and light modes.
export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggle = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  return (
    <button onClick={toggle} className="p-2 rounded-xl transition-all hover:opacity-80"
      style={{ background: 'rgba(99,102,241,0.1)' }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      {isDark ? <Sun className="w-5 h-5" style={{ color: '#eab308' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--accent)' }} />}
    </button>
  );
}
