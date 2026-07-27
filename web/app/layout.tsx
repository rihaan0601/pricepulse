import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import InstallPrompt from "./components/InstallPrompt";
import AppShell from "./components/AppShell";
import { ToastContainer } from "./components/ToastNotification";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#0a0c10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "PricePulse - Hyper-Local Cart Optimization",
  description: "Real-time hyper-local e-commerce price comparison and cart-optimization across India's quick-commerce platforms.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PricePulse",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 flex flex-col justify-between`}
      >
        <Providers>
          <main className="relative flex flex-col flex-1 pb-16 md:pb-0">
            <div className="flex-1 flex-col flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
              {children}
            </div>
          </main>
          
          {/* Legal Copyright Footer */}
          <footer className="w-full border-t border-border/40 bg-card/30 backdrop-blur-xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex flex-col space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="font-bold text-foreground tracking-tight text-sm">PricePulse Engine</span>
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] px-2 py-0.5 rounded-full font-medium">Proprietary IP</span>
                </div>
                <p>© 2026 PricePulse Technologies. All Rights Reserved. Idea, Server Architecture & Application Protected.</p>
                <p className="text-[11px] opacity-75">All platform names (Blinkit, Zepto, Swiggy Instamart, Amazon) & product trademarks belong to their respective owners (Nominative Fair Use).</p>
              </div>

              <div className="flex items-center space-x-6 text-xs">
                <span className="hover:text-primary transition-colors cursor-pointer" title="All algorithms, connectors & design systems protected under law">Protected System</span>
                <span>•</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Terms & Copyright</span>
                <span>•</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Hyperlocal Aggregator</span>
              </div>
            </div>
          </footer>

          <InstallPrompt />
          <AppShell />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}

