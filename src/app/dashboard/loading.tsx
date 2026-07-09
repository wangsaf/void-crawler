"use client";

import { useEffect, useState } from "react";

function ZoneLoadingScreen({ zone }: { zone: string }) {
  const [dots, setDots] = useState(".");
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 400);
    const scanInterval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 100);
    }, 30);
    return () => { clearInterval(dotInterval); clearInterval(scanInterval); };
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "var(--color-void-black)", fontFamily: "var(--font-mono)", zIndex: 50 }}
    >
      <div
        className="fixed inset-x-0 pointer-events-none"
        style={{ top: `${scanLine}%`, height: 1, background: "rgba(208,208,216,0.03)", transition: "top 0.03s linear" }}
      />
      <div className="text-center">
        <div style={{ fontSize: 28, color: "var(--color-text-ghost)", marginBottom: 16 }}>◎</div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", letterSpacing: "0.15em", marginBottom: 8 }}>
          ENTERING {zone.toUpperCase()} ZONE
        </div>
        <div style={{ fontSize: 10, color: "var(--color-text-ghost)", minHeight: 16 }}>
          Initializing subsystems{dots}
        </div>
        <div className="mx-auto mt-4 overflow-hidden" style={{ width: 120, height: 2, background: "var(--color-void-border)" }}>
          <div className="h-full" style={{ background: "var(--color-text-ghost)", animation: "loading-bar 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <style>{`@keyframes loading-bar { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }`}</style>
    </div>
  );
}

export default function DashboardLoading() {
  return <ZoneLoadingScreen zone="dashboard" />;
}
