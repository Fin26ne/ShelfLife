import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookProvider } from "@/context/BookContext";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShelfLife - Book Management",
  description: "Track and organize your personal reading journey with ShelfLife.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BookProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </BookProvider>
      </body>
    </html>
  );
}
