import { CheckCircle2, Clock, MapPin } from "lucide-react";

const reports = [
  { id: 1, location: "Marina Beach, Chennai", description: "Large pile of plastic bottles near shore", status: "pending", date: "Apr 15, 2026", reporter: "Citizen" },
  { id: 2, location: "T. Nagar, Chennai", description: "Plastic bags dumped near Pondy Bazaar", status: "collected", date: "Apr 14, 2026", reporter: "Shop Owner" },
  { id: 3, location: "Besant Nagar Beach, Chennai", description: "Packaging waste along the promenade", status: "pending", date: "Apr 14, 2026", reporter: "Jogger" },
  { id: 4, location: "Velachery, Chennai", description: "Construction plastic waste near lake", status: "collected", date: "Apr 13, 2026", reporter: "NGO Volunteer" },
  { id: 5, location: "Ashok Nagar, Chennai", description: "Food packaging waste near park", status: "pending", date: "Apr 13, 2026", reporter: "Citizen" },
  { id: 6, location: "Kodambakkam, Chennai", description: "Styrofoam and plastic cups in drain", status: "pending", date: "Apr 12, 2026", reporter: "Resident" },
];

export default function Reports() {
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
          </div>
        ))}
      </div>
    </div>
  );
}
