import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorites() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    supabase
      .from("user_favorites")
      .select("report_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setIds(new Set((data ?? []).map((r) => r.report_id)));
        setLoading(false);
      });
  }, [user]);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (reportId: string): Promise<boolean | null> => {
      if (!user) return null;
      const has = ids.has(reportId);
      // optimistic
      setIds((prev) => {
        const next = new Set(prev);
        if (has) next.delete(reportId);
        else next.add(reportId);
        return next;
      });
      if (has) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("report_id", reportId);
        if (error) {
          setIds((prev) => new Set(prev).add(reportId));
          throw error;
        }
        return false;
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: user.id, report_id: reportId });
        if (error) {
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(reportId);
            return next;
          });
          throw error;
        }
        return true;
      }
    },
    [user, ids],
  );

  return { isFavorite, toggle, loading, signedIn: !!user };
}