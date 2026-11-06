"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookContext } from "@/context/BookContext";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Header() {
  const { user, signOut } = useBookContext();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <BookOpen className="h-6 w-6" />
            <span>ShelfLife</span>
          </Link>
        </div>

        <nav className="flex items-center gap-3 flex-wrap">
          {user ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span
                data-testid="user-email"
                className="text-sm font-medium text-muted-foreground break-all"
              >
                {user.email}
              </span>
              <Link
                href="/books"
                data-testid="link-books"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                My Shelf
              </Link>
              <Button
                type="button"
                data-testid="btn-logout"
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                data-testid="btn-login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Login
              </Link>
              <Link
                href="/register"
                data-testid="btn-register"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
