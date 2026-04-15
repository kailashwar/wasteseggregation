import { createContext, useContext, useState, ReactNode } from "react";

export interface WasteReport {
  id: number;
  lat: number;
  lng: number;
  location: string;
  description: string;
  status: "pending" | "collected";
  date: string;
  reporter: string;
  photo?: string;
}
  reporter: string;
}

const initialReports: WasteReport[] = [
  { id: 1, lat: 13.0499, lng: 80.2824, location: "Marina Beach, Chennai", description: "Large pile of plastic bottles near shore", status: "pending", date: "Apr 15, 2026", reporter: "Citizen" },
  { id: 2, lat: 13.0827, lng: 80.2707, location: "T. Nagar, Chennai", description: "Plastic bags dumped near Pondy Bazaar", status: "collected", date: "Apr 14, 2026", reporter: "Shop Owner" },
  { id: 3, lat: 13.0674, lng: 80.2376, location: "Ashok Nagar, Chennai", description: "Packaging waste near park", status: "pending", date: "Apr 14, 2026", reporter: "Jogger" },
  { id: 4, lat: 13.1143, lng: 80.2851, location: "Besant Nagar Beach, Chennai", description: "Fishing nets and plastic debris", status: "collected", date: "Apr 13, 2026", reporter: "NGO Volunteer" },
  { id: 5, lat: 13.0036, lng: 80.2557, location: "Velachery, Chennai", description: "Construction plastic waste near lake", status: "pending", date: "Apr 13, 2026", reporter: "Citizen" },
  { id: 6, lat: 13.0604, lng: 80.2496, location: "Kodambakkam, Chennai", description: "Styrofoam and plastic cups in drain", status: "pending", date: "Apr 12, 2026", reporter: "Resident" },
];

interface WasteContextType {
  reports: WasteReport[];
  markCollected: (id: number) => void;
  addReport: (report: Omit<WasteReport, "id">) => void;
}

const WasteContext = createContext<WasteContextType | null>(null);

export function WasteProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<WasteReport[]>(initialReports);

  const markCollected = (id: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "collected" as const } : r))
    );
  };

  const addReport = (report: Omit<WasteReport, "id">) => {
    setReports((prev) => [...prev, { ...report, id: Date.now() }]);
  };

  return (
    <WasteContext.Provider value={{ reports, markCollected, addReport }}>
      {children}
    </WasteContext.Provider>
  );
}

export function useWaste() {
  const ctx = useContext(WasteContext);
  if (!ctx) throw new Error("useWaste must be used within WasteProvider");
  return ctx;
}
