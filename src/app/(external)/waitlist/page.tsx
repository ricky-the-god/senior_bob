import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

import { WaitlistForm } from "./_components/waitlist-form";

export const metadata = {
  title: "Join the Waitlist — SeniorBob",
  description: "Be the first to know when SeniorBob launches.",
};

export default function WaitlistPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <AnimatedShaderBackground />

      {/* Logo */}
      <a href="/" className="mb-12 flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100">
        <span className="font-mono-tight text-sm text-zinc-950/60 dark:text-zinc-50/60">
          senior<span className="text-primary">bob</span>
        </span>
      </a>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-950/10 bg-zinc-50/80 px-8 py-10 shadow-xl shadow-zinc-950/5 backdrop-blur-sm dark:border-zinc-50/10 dark:bg-zinc-950/80 dark:shadow-zinc-950/30">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 font-mono-tight text-[11px] uppercase tracking-widest text-primary/80">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Early access
            </span>
          </div>

          {/* Headline */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-normal text-2xl text-editorial leading-tight tracking-tight text-zinc-950 dark:text-zinc-50">
              SeniorBob is almost ready
            </h1>
            <p className="text-sm leading-relaxed text-zinc-950/50 dark:text-zinc-50/50">
              Turn your app idea into a clear architecture and Claude Code-ready context. Join the waitlist to get early
              access.
            </p>
          </div>

          <WaitlistForm />

          <p className="mt-4 text-center font-mono-tight text-[10px] text-zinc-950/30 dark:text-zinc-50/30">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 font-mono-tight text-[11px] text-zinc-950/25 dark:text-zinc-50/25">
        © {new Date().getFullYear()} SeniorBob
      </p>
    </div>
  );
}
