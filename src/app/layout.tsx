import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { clinicIdentity } from "@/config/clinic";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${clinicIdentity.name} — Appointment Booking`,
  description:
    "Request a clinic appointment online and receive confirmation by email.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pale text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
