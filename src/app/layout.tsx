import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryProviders } from "@/providers/QueryProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { MotionToaster } from "@/components/motion/MotionToaster";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Inter-like sans from the design (variable font, self-hosted by next/font)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PH Healthcare Service Management",
  description: "PH Healthcare Service Management System Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // set by proxy.ts together with the Content-Security-Policy
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang="en"
      // next-themes sets the theme class before React hydrates
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground text-sm">
        <ThemeProvider nonce={nonce}>
          <QueryProviders nonce={nonce}>
            <MotionProvider>
              {children}
              {/* floating, swipe-to-dismiss notifications for toast.success / toast.error */}
              <MotionToaster />
            </MotionProvider>
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
