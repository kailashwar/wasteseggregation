import { useState, useMemo } from "react";
import { CheckCircle2, Clock, PlayCircle, Filter } from "lucide-react";
import { useReports, ReportStatus } from "@/hooks/useReports";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_META: Record<ReportStatus, { label: string; cls: string; icon: any }> = {
  pending: { label: "Pending", cls: "bg-warning/10 text-warning", icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-primary/10 text-primary", icon: PlayCircle },
  completed: { label: "Completed", cls: "bg-success/10 text-success", icon: CheckCircle2 },
};

export default function Reports() {
  const { reports, loading, updateStatus } = useReports();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");

  const filtered = useMemo(
    () => (filter === "all" ? reports : reports.filter((r) => r.status === filter)),
    [reports, filter]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-heading font-bold">{isAdmin ? "All Reports" : "My Reports"}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? "Browse and update garbage reports" : "Reports you've submitted"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!loading && filtered.length === 0 && (
        <div className="glass-card rounded-lg p-8 text-center text-sm text-muted-foreground">
          No reports {filter !== "all" ? `with status "${filter.replace("_", " ")}"` : "yet"}.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((r) => {
          const meta = STATUS_META[r.status];
          const Icon = meta.icon;
          return (
            <div key={r.id} className="glass-card rounded-lg p-4 flex items-start gap-4 animate-fade-in">
              {r.photo_url ? (
                <img src={r.photo_url} alt="Report" className="h-16 w-16 rounded-md object-cover shrink-0" />
              ) : (
                <div className={`h-16 w-16 rounded-md flex items-center justify-center shrink-0 ${meta.cls}`}>
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm truncate">{r.location_name ?? "Reported location"}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
                {r.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  {isAdmin && <span>by {r.reporter_username ?? "User"}</span>}
                </div>
              </div>
              {isAdmin && (
                <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v as ReportStatus)}>
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
