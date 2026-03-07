import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Falcon Tiers — PvP Rankings",
  description: "The #1 leaderboard for CPVP, NethPot, and SMP Kit players. Search your rank, claim your tier.",
};

import MaintenanceBanner from "@/components/MaintenanceBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body>
        <MaintenanceBanner />
        {children}
      </body>
    </html>
  );
}
