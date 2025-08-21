import { useEffect, useState } from "react";

export function Background() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Dynamic background based on time
  const getTimeBasedGradient = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour <= 8) {
      // Dawn
      return "radial-gradient(1200px 800px at 20% 10%, rgba(244,114,182,0.25), transparent 60%), radial-gradient(900px 700px at 80% 90%, rgba(56,189,248,0.22), transparent 60%), linear-gradient(180deg, #0b1020 0%, #0a1224 100%)";
    } else if (hour >= 9 && hour <= 16) {
      // Day
      return "radial-gradient(1100px 700px at 15% 15%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(900px 600px at 85% 75%, rgba(16,185,129,0.20), transparent 60%), linear-gradient(180deg, #0a1428 0%, #0a1a30 100%)";
    } else if (hour >= 17 && hour <= 20) {
      // Dusk
      return "radial-gradient(1200px 800px at 20% 10%, rgba(249,115,22,0.25), transparent 60%), radial-gradient(900px 600px at 80% 85%, rgba(168,85,247,0.20), transparent 60%), linear-gradient(180deg, #0a1224 0%, #0a1020 100%)";
    } else {
      // Night
      return "radial-gradient(1200px 800px at 20% 10%, rgba(14,165,233,0.20), transparent 60%), radial-gradient(900px 600px at 80% 80%, rgba(99,102,241,0.18), transparent 60%), linear-gradient(180deg, #070a14 0%, #060812 100%)";
    }
  };

  return (
    <>
      {/* Dynamic gradient background */}
      <div
        className="fixed inset-0 -z-50 transition-all duration-[2000ms]"
        style={{ background: getTimeBasedGradient() }}
      />

      {/* Subtle star/particle layer */}
      <div className="pointer-events-none fixed inset-0 -z-40">
        <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]">
          <div className="absolute top-10 left-20 w-1 h-1 rounded-full bg-cyan-400/40 blur-[1px] animate-pulse"></div>
          <div className="absolute top-1/3 right-24 w-1 h-1 rounded-full bg-fuchsia-400/40 blur-[1px] animate-pulse delay-200"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 rounded-full bg-emerald-400/40 blur-[1px] animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 rounded-full bg-sky-400/40 blur-[1px] animate-pulse delay-700"></div>
          <div className="absolute bottom-16 right-1/3 w-1 h-1 rounded-full bg-indigo-400/40 blur-[1px] animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Cursor-following orbs */}
      <div
        className="pointer-events-none fixed -z-30 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl mix-blend-screen transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${cursorPosition.x * 0.12}px, ${
            cursorPosition.y * 0.1
          }px, 0)`,
        }}
      />
      <div
        className="pointer-events-none fixed -z-30 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl mix-blend-screen transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${cursorPosition.x * 0.06}px, ${
            cursorPosition.y * 0.08
          }px, 0)`,
        }}
      />
    </>
  );
}
