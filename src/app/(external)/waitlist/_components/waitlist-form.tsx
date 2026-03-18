"use client";

import { useActionState } from "react";

import { joinWaitlist } from "@/server/waitlist";

const initialState = { success: false as boolean | undefined, message: "", error: "" };

export const WaitlistForm = () => {
  const [state, action, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await joinWaitlist(formData);
    return result.success
      ? { success: true, message: result.message, error: "" }
      : { success: false, message: "", error: result.error };
  }, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <svg
            aria-hidden="true"
            className="size-5 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-medium text-sm text-zinc-950 dark:text-zinc-50">{state.message}</p>
        <p className="text-sm text-zinc-950/50 dark:text-zinc-50/50">We'll email you when SeniorBob launches.</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          name="name"
          placeholder="Your name (optional)"
          autoComplete="name"
          className="w-full rounded-lg border border-zinc-950/10 bg-zinc-950/[0.02] px-4 py-2.5 text-sm text-zinc-950 placeholder-zinc-950/30 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-zinc-50/10 dark:bg-zinc-50/[0.02] dark:text-zinc-50 dark:placeholder-zinc-50/30 dark:focus:border-primary/40"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-zinc-950/10 bg-zinc-950/[0.02] px-4 py-2.5 text-sm text-zinc-950 placeholder-zinc-950/30 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-zinc-50/10 dark:bg-zinc-50/[0.02] dark:text-zinc-50 dark:placeholder-zinc-50/30 dark:focus:border-primary/40"
        />
      </div>

      {state.error && <p className="text-center text-sm text-red-500/80">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="relative w-full overflow-hidden rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {pending ? "Joining..." : "Join the waitlist"}
      </button>
    </form>
  );
};
