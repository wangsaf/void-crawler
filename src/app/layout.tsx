import type { Metadata } from "next";
import {
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
});

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
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
