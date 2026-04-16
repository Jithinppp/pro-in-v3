import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const calSans = localFont({
  src: "../node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2",
  variable: "--font-cal-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_ORG_NAME || 'PROIN'} ${process.env.NEXT_PUBLIC_APP_NAME || ''}`,
  description: "Professional Asset Management System",
};

import { ToastProvider } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", inter.variable, calSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-white">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}

