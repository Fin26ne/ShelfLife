"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookContext } from "@/context/BookContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useBookContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/books");
    }
  }, [user, isAuthLoading, router]);

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) {
      return "Password is required";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setAuthError("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(val),
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setAuthError("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(val),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setErrors({
      email: emailErr,
      password: passwordErr,
    });

    if (emailErr || passwordErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.session || data.user) {
        router.push("/books");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign in to ShelfLife
          </CardTitle>
          <CardDescription>
            Enter your email and password to access your bookshelf
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            data-testid="login-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email"
                placeholder="reader@example.com"
                value={email}
                onChange={handleEmailChange}
              />
              {errors.email && (
                <p
                  data-testid="error-email"
                  className="text-sm text-destructive"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="login-password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
              />
              {errors.password && (
                <p
                  data-testid="error-password"
                  className="text-sm text-destructive"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {authError && (
              <p data-testid="error-auth" className="text-sm text-destructive">
                {authError}
              </p>
            )}

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Don&apos;t have an account?&nbsp;
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
