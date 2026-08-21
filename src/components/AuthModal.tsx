import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export function AuthModal() {
  const { authOpen, closeAuth } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPassword = form.password;
    const cleanName = form.name.trim();
    const cleanPhone = form.phone.trim().replace(/\D/g, "");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (cleanPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (cleanPassword.length > 72) {
      toast.error("Password is too long (maximum 72 characters).");
      return;
    }

    if (mode === "signup") {
      if (cleanName.length < 2 || cleanName.length > 100) {
        toast.error("Please enter your full name (2–100 characters).");
        return;
      }
      if (cleanPhone.length !== 10) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: cleanName, phone: cleanPhone },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Welcome to Shivi Parlour & Boutique!");
          closeAuth();
        } else {
          toast.success("Almost done — check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (error) throw error;
        toast.success("Signed in successfully");
        closeAuth();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (msg.toLowerCase().includes("user already registered")) {
        toast.error("An account with this email already exists. Please sign in.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    setBusy(false);
    closeAuth();
  }

  return (
    <Dialog open={authOpen} onOpenChange={(open) => (open ? undefined : closeAuth())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Sign in to book appointments, order cosmetics and track tailor visits."
              : "Register with your name, phone number and a password to start booking."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="auth-name">Full name</Label>
                <Input
                  id="auth-name"
                  value={form.name}
                  onChange={update("name")}
                  required
                  placeholder="Shivani Verma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-phone">Phone number</Label>
                <Input
                  id="auth-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={update("phone")}
                  required
                  placeholder="10-digit mobile number"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              placeholder="you@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={update("password")}
              required
              placeholder="At least 6 characters"
            />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New customer?" : "Already registered?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
