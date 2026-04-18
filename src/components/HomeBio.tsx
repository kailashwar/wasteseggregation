import { Heart, Leaf, Sparkles } from "lucide-react";

export function HomeBio() {
  return (
    <section className="glass-card rounded-2xl p-6 md:p-8 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          A note from us
        </span>
      </div>
      <h3 className="font-heading text-xl md:text-2xl font-semibold leading-snug">
        Welcome to Plastic Spotter — small snaps, big change. 🌱
      </h3>
      <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
        Every photo you share is a kind hand reaching out to your neighborhood. Together
        we're turning quiet streets into cleaner ones, one report at a time. Thank you for
        caring enough to look, to pause, and to spot what others walk past. Your little act
        today is a gentler tomorrow for someone else.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5">
          <Leaf className="h-3.5 w-3.5 text-primary" /> Cleaner streets
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Earn credits as you contribute
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5">
          <Heart className="h-3.5 w-3.5 text-primary" /> Built with community in mind
        </span>
      </div>
    </section>
  );
}
