import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Navigation } from "@/components/Navigation";
import "./globals.css";
import { cn } from "@/lib/utils";

const nunitoSans = Nunito_Sans({variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WWA Trading Journal",
  description: "Personal trading journal for the WWA Trading Strategy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", nunitoSans.variable)}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <ConvexClientProvider>
          <div className="flex flex-1">
            <Navigation />
            <main className="flex-1 p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
