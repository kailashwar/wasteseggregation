import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

const FAQ: { q: string; keywords: string[]; a: string }[] = [
  {
    q: "How do I report waste?",
    keywords: ["report", "submit", "upload", "photo", "waste", "garbage"],
    a: "Open the 'Report Garbage' page, tap the camera area to capture a live photo, allow location access, add an optional description, and hit Submit.",
  },
  {
    q: "How do I earn credits?",
    keywords: ["earn", "credit", "points", "reward points"],
    a: "You earn credits every time you submit a valid waste report. Higher-priority reports (like plastic or hazardous waste) can earn more.",
  },
  {
    q: "How do I redeem rewards?",
    keywords: ["redeem", "reward", "gift", "voucher"],
    a: "Go to 'My Credits' from the sidebar. There you'll see your credit balance and a QR code you can present to redeem available rewards.",
  },
  {
    q: "How do I segregate waste?",
    keywords: ["segregate", "sort", "separate", "type", "category"],
    a: "Separate waste into plastic (red — high priority), general/medium (yellow), and low/organic (green). Mentioning 'plastic' or 'hazard' in your report auto-flags it as high priority.",
  },
  {
    q: "What do the map colors mean?",
    keywords: ["map", "color", "colour", "red", "yellow", "green", "priority"],
    a: "Red = high priority (plastic/hazardous), Yellow = medium, Green = low. Red reports are shown on top of the map so cleanups can be prioritised.",
  },
  {
    q: "Why can't I upload from my gallery?",
    keywords: ["gallery", "library", "device", "camera only"],
    a: "To ensure reports are real and current, only live camera photos are accepted. Gallery uploads are disabled by design.",
  },
  {
    q: "How do I use the dashboard?",
    keywords: ["dashboard", "home", "stats"],
    a: "The dashboard shows your reports, credits, and (for admins) overall analytics. Use the sidebar to navigate between Home, Report, Map, Reports, and Credits.",
  },
  {
    q: "How do I change account settings?",
    keywords: ["account", "settings", "password", "email", "profile", "logout", "sign out"],
    a: "Use the Logout button at the bottom of the sidebar to sign out. For password or email changes, please contact support from the login page.",
  },
  {
    q: "The app isn't working — troubleshooting?",
    keywords: ["not working", "issue", "error", "bug", "trouble", "fix", "problem"],
    a: "Try refreshing the page, allowing camera and location permissions, and checking your internet connection. If the issue persists, contact support.",
  },
];

const QUICK = [
  "How do I report waste?",
  "How do I earn credits?",
  "How do I segregate waste?",
  "How do I redeem rewards?",
];

function answer(input: string): string {
  const q = input.toLowerCase();
  let best: { score: number; a: string } | null = null;
  for (const f of FAQ) {
    let score = 0;
    if (q.includes(f.q.toLowerCase())) score += 10;
    for (const k of f.keywords) if (q.includes(k)) score += 1;
    if (!best || score > best.score) best = { score, a: f.a };
  }
  if (!best || best.score === 0) {
    return "I couldn't find that information. Please contact our support team for further assistance.";
  }
  return best.a;
}

export function HelpChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your Waste Segregation assistant. Ask me anything, or pick a quick question below." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }, { role: "bot", text: answer(t) }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close help chat" : "Open help chat"}
        className="fixed bottom-5 right-5 z-[1000] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[1000] w-[92vw] max-w-sm h-[70vh] max-h-[520px] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-primary/10">
            <p className="font-heading font-semibold text-sm">Help & FAQ</p>
            <p className="text-xs text-muted-foreground">Waste Segregation assistant</p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 text-sm max-w-[80%]"
                      : "bg-muted text-foreground rounded-2xl rounded-bl-sm px-3 py-2 text-sm max-w-[85%]"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-2 border-t flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              aria-label="Send"
              className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
