import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// Google Sans is propriety, so DM_Sans is the exact open-source geometric equivalent on next/font/google!
const googleSans = DM_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_ORG_NAME || 'PROIN'} ${process.env.NEXT_PUBLIC_APP_NAME || ''}`,
  description: "Professional Asset Management System",
};

import { ToastProvider } from "@/components/providers/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
