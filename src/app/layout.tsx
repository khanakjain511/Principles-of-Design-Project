import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "SmartRide Connect",
  description:
    "A simple notice board for sharing rides between campus and nearby cities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
