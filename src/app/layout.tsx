import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dairy Manager",
  description: "Simple inventory and transaction tracking",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <ConvexClientProvider>
          <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <nav className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Dairy Manager
              </span>
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Inventory
              </Link>
              <Link
                href="/transactions"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Transactions
              </Link>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
            {children}
          </main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
