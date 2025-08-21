import { useState, useEffect } from "react";

interface WelcomeHeaderProps {
  onStartChat: () => void;
}

export function WelcomeHeader({ onStartChat }: WelcomeHeaderProps) {
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    // Show greeting after initial load
    const timer1 = setTimeout(() => setShowGreeting(true), 400);
    const timer2 = setTimeout(() => setShowGreeting(false), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      {/* Onboarding greeting */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-700 ${
          showGreeting
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-4 py-2.5 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)]"></div>
          <p className="text-sm tracking-tight">Hey! Ready to explore Ricky?</p>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-center text-slate-100 font-medium">
          Local Custom Personal Assistant
        </h1>
        <p className="mt-3 text-slate-400 text-sm md:text-base text-center max-w-2xl">
          Chat naturally, manage your memory, analyze files, and execute
          actions. Your personal AI assistant, locally powered.
        </p>

        {/* Quick start button */}
        <button
          onClick={onStartChat}
          className="mt-8 px-6 py-3 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-sky-500/20 hover:from-cyan-400/30 hover:to-sky-500/30 border border-white/10 backdrop-blur-xl text-slate-100 text-sm tracking-tight transition-all duration-300 active:scale-95"
        >
          Start Conversation
        </button>
      </div>

      {/* Decorative particles */}
      <div className="absolute inset-0 grid place-items-center -z-10">
        <div className="relative w-[28rem] h-[28rem] max-w-[85vw]">
          <div className="absolute left-8 top-10 w-1.5 h-1.5 rounded-full bg-white/30 blur-[1px] animate-pulse"></div>
          <div className="absolute right-12 top-24 w-1 h-1 rounded-full bg-white/20 blur-[1px] animate-pulse delay-200"></div>
          <div className="absolute left-1/3 bottom-16 w-1.5 h-1.5 rounded-full bg-white/25 blur-[1px] animate-pulse delay-500"></div>
          <div className="absolute right-20 bottom-12 w-1 h-1 rounded-full bg-white/20 blur-[1px] animate-pulse delay-700"></div>
        </div>
      </div>
    </>
  );
}
