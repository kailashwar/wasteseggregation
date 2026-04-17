import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ReportStatus = "pending" | "in_progress" | "completed";
export type ReportPriority = "low" | "medium" | "high";

export interface Report {
  id: string;
  user_id: string;
  photo_url: string;
  lat: number;
  lng: number;
  location_name: string | null;
  description: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  created_at: string;
  updated_at: string;
  reporter_username?: string | null;
}

export function useReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load reports:", error);
      setReports([]);
      setLoading(false);
      return;
    }

    // Hydrate reporter usernames
    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let nameMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", ids);
      nameMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.username ?? "User"]));
    }

    setReports(
      (rows ?? []).map((r) => ({ ...r, reporter_username: nameMap[r.user_id] ?? "User" })) as Report[]
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) refetch();
    else {
      setReports([]);
      setLoading(false);
    }
  }, [user, refetch]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("reports-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const updateStatus = async (id: string, status: ReportStatus) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) throw error;
  };

  return { reports, loading, refetch, updateStatus };
}
