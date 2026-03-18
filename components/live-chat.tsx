"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "👋 Hi there! How can we help you today?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Thanks for reaching out! Our team will get back to you shortly. For immediate help, check our FAQ or email support@aiempire.com.",
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-transform"
        aria-label="Live Chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-h-96 flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
            AI Empire Support
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-text)]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-[var(--color-border)] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none"
            />
            <button onClick={send} className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
