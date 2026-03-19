import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HorizontalNav } from "@/components/HorizontalNav";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased",
        geistSans.variable,
        geistMono.variable,
        nunitoSans.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <div className="relative flex min-h-screen flex-col">
              <HorizontalNav />
              <main className="flex-1 container py-6 px-4 max-w-7xl mx-auto">
                {children}
              </main>
            </div>
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
