import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AchievementToast } from "@/components/rpg/achievement-toast";
import { NotificationStack } from "@/components/rpg/notification-stack";
import { VolumeControl } from "@/components/rpg/volume-control";
import { VoidFlowField } from "@/components/effects/void-flow-field";
import { CorruptionOverlay } from "@/components/effects/corruption";
import { VoidCursor } from "@/components/effects/void-cursor";
import { ChaosEffects } from "@/components/effects/chaos-effects";
import { BreathingViewport } from "@/components/effects/corruption";
import { LivingVoid } from "@/components/effects/living-void";
import { ChaosMeter } from "@/components/rpg/chaos-meter";
import { RandomEventPopup, ChaosEventSpawner } from "@/components/rpg/random-event";
import { EnhancedHUD } from "@/components/rpg/enhanced-hud";
import { ChaosModeBody } from "@/components/effects/chaos-mode-body";
import { ChaosEngine } from "@/components/rpg/chaos-engine";
import { PerformanceBanner, PerformanceGate } from "@/components/effects/performance-banner";
import { VoidDeathOverlay } from "@/components/rpg/void-death-overlay";

export const metadata: Metadata = {
  title: "void.crawler()",
  description:
    "A web experience at the edge of reality. Explore zones, encounter anomalies, survive the void.",
  keywords: ["void", "web", "interactive", "anomaly", "cybersecurity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <PerformanceBanner />
          <ChaosModeBody />
          <BreathingViewport />
          <PerformanceGate>
            <VoidFlowField />
            <ChaosEffects />
            <LivingVoid />
          </PerformanceGate>
          <CorruptionOverlay />
          <VoidCursor />
          <div id="main-content" role="main" aria-label="Void Crawler main content">
            {children}
          </div>
          <EnhancedHUD />
          <ChaosMeter />
          <AchievementToast />
          <NotificationStack />
          <RandomEventPopup />
          <ChaosEventSpawner />
          <ChaosEngine />
          <VoidDeathOverlay />
          <VolumeControl />
        </Providers>
      </body>
    </html>
  );
}
