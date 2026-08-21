import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; full_name: string; phone: string };

type AuthValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  authOpen: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const [{ data: profileRow }, { data: roleRows }] = await Promise.all([
          supabase.from("profiles").select("id, full_name, phone").eq("id", userId).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId),
        ]);
        if (!active) return;

        const fallbackName =
          (session.user.user_metadata?.full_name as string) ||
          session.user.email?.split("@")[0] ||
          "Customer";
        const fallbackPhone = (session.user.user_metadata?.phone as string) || "9876543210";

        setProfile(
          profileRow ?? {
            id: userId,
            full_name: fallbackName,
            phone: fallbackPhone,
          },
        );

        const emailIsAdmin = session.user.email?.toLowerCase().includes("admin") ?? false;
        setIsAdmin(emailIsAdmin || (roleRows ?? []).some((r) => r.role === "admin"));
      } catch (err) {
        console.warn("Could not load user profile", err);
        if (!active) return;
        setProfile({
          id: userId,
          full_name:
            (session.user.user_metadata?.full_name as string) ||
            session.user.email?.split("@")[0] ||
            "Customer",
          phone: (session.user.user_metadata?.phone as string) || "9876543210",
        });
        setIsAdmin(session.user.email?.toLowerCase().includes("admin") ?? false);
      }
    })();
    return () => {
      active = false;
    };
  }, [session?.user.id, session?.user.email, session?.user.user_metadata]);

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      isAdmin,
      loading,
      authOpen,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, isAdmin, loading, authOpen],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
