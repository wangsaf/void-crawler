import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AchievementToast } from "@/components/rpg/achievement-toast";
import { NotificationStack } from "@/components/rpg/notification-stack";
import { VolumeControl } from "@/components/rpg/volume-control";

export const metadata: Metadata = {
  title: "void.crawler() — The Web That Is Alive",
  description:
    "An RPG web experience where web development concepts become gameplay. Explore zones, fight bugs, cast CSS spells, and level up.",
  keywords: ["RPG", "web", "interactive", "game", "cybersecurity", "developer"],
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
        style={{ fontFamily: "'VT323', monospace", fontSize: "18px" }}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <div id="main-content" role="main" aria-label="Void Crawler main content">
            {children}
          </div>
          <AchievementToast />
          <NotificationStack />
          <VolumeControl />
        </Providers>
      </body>
    </html>
  );
}
