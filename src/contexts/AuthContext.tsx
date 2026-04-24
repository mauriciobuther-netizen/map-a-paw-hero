import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  hasAcceptedTerms: boolean | null;
  refreshTermsAcceptance: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);

  useEffect(() => {
    // Set up listener BEFORE getSession (per Supabase auth pattern)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer to avoid deadlocks
        setTimeout(() => {
          fetchProfile(newSession.user.id);
          fetchTerms(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setHasAcceptedTerms(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        fetchProfile(existing.user.id);
        fetchTerms(existing.user.id);
      }
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  };

  const fetchTerms = async (userId: string) => {
    const { data } = await supabase
      .from("user_terms_acceptance")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    setHasAcceptedTerms(!!data);
  };

  const refreshTermsAcceptance = async () => {
    if (user) await fetchTerms(user.id);
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/app/explore`,
    });
    if (result.error) return { error: result.error };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setHasAcceptedTerms(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        hasAcceptedTerms,
        refreshTermsAcceptance,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}