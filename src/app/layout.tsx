import type { Metadata } from "next";
import { Urbanist, Manrope } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "iBookSports — Sports Arena & Turf Management Platform",
  description:
    "The complete sports venue booking and partner operating system for turfs, courts, and sporting arenas.",
  icons: {
    icon: "/brand/logo-48.png",
    apple: "/brand/logo-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${urbanist.variable} ${manrope.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen bg-[#F8F9FA] text-[#021526]">
        {children}
      </body>
    </html>
  );
}
