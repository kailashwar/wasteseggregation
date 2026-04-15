import { CheckCircle2, Clock } from "lucide-react";
import { useWaste } from "@/contexts/WasteContext";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const { reports, markCollected } = useWaste();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">All Reports</h2>
        <p className="text-muted-foreground text-sm mt-1">Browse and manage waste reports</p>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="glass-card rounded-lg p-4 flex items-start gap-4 animate-fade-in">
            <div className={`mt-1 h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
              report.status === "collected" ? "bg-success/10" : "bg-warning/10"
            }`}>
              {report.status === "collected" ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Clock className="h-5 w-5 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm">{report.location}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  report.status === "collected" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{report.date}</span>
                <span>by {report.reporter}</span>
              </div>
            </div>
            {report.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-xs"
                onClick={() => markCollected(report.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Collect
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
