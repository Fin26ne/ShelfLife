"use client";

import React, { useState } from "react";
import Link from "next/link";
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

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (val.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateConfirmPassword = (val: string, currentPassword: string) => {
    if (!val) {
      return "Confirm password is required";
    }
    if (val !== currentPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setAuthError("");
    setSuccessMsg("");
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
    setSuccessMsg("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(val),
        confirmPassword: validateConfirmPassword(confirmPassword, val),
      }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setAuthError("");
    setSuccessMsg("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(val, password),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError("");
    setSuccessMsg("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    setErrors({
      email: emailErr,
      password: passwordErr,
      confirmPassword: confirmErr,
    });

    if (emailErr || passwordErr || confirmErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setAuthError("User already registered");
        return;
      }

      setSuccessMsg("Registration successful");
    } catch (err: any) {
      setAuthError(err.message || "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Join ShelfLife to track your reading journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            data-testid="register-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="register-email"
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
                data-testid="register-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                data-testid="register-confirm-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {errors.confirmPassword && (
                <p
                  data-testid="error-confirm-password"
                  className="text-sm text-destructive"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {authError && (
              <p data-testid="error-auth" className="text-sm text-destructive">
                {authError}
              </p>
            )}

            {successMsg && (
              <p
                data-testid="form-success"
                className="text-sm text-green-600 font-medium"
              >
                {successMsg}
              </p>
            )}

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
