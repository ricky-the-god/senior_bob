import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/server/auth";
import { getWaitlist } from "@/server/waitlist";

export const metadata = { title: "Waitlist — Admin" };

export default async function AdminWaitlistPage() {
  const { user } = await getAuthenticatedUser().catch(() => redirect("/auth/v3/login"));

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) redirect("/unauthorized");

  const entries = await getWaitlist();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <span className="mb-3 block font-mono-tight text-[11px] uppercase tracking-widest text-primary/80">Admin</span>
        <h1 className="font-normal text-3xl text-editorial tracking-tight text-zinc-950 dark:text-zinc-50">Waitlist</h1>
        <p className="mt-2 text-sm text-zinc-950/50 dark:text-zinc-50/50">
          {entries.length} {entries.length === 1 ? "signup" : "signups"}
        </p>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-zinc-950/10 bg-zinc-950/[0.02] px-8 py-16 text-center dark:border-zinc-50/10 dark:bg-zinc-50/[0.02]">
          <p className="text-sm text-zinc-950/40 dark:text-zinc-50/40">No signups yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-950/10 dark:border-zinc-50/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-950/8 bg-zinc-950/[0.02] dark:border-zinc-50/8 dark:bg-zinc-50/[0.02]">
                <th className="px-4 py-3 text-left font-mono-tight text-[10px] uppercase tracking-widest text-zinc-950/40 dark:text-zinc-50/40">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-mono-tight text-[10px] uppercase tracking-widest text-zinc-950/40 dark:text-zinc-50/40">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-mono-tight text-[10px] uppercase tracking-widest text-zinc-950/40 dark:text-zinc-50/40">
                  Signed up
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-b border-zinc-950/6 last:border-0 dark:border-zinc-50/6 ${
                    i % 2 === 0 ? "" : "bg-zinc-950/[0.01] dark:bg-zinc-50/[0.01]"
                  }`}
                >
                  <td className="px-4 py-3 font-mono-tight text-xs text-zinc-950/80 dark:text-zinc-50/80">
                    {entry.email}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-950/50 dark:text-zinc-50/50">
                    {entry.name ?? <span className="text-zinc-950/25 dark:text-zinc-50/25">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono-tight text-xs text-zinc-950/40 dark:text-zinc-50/40">
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export hint */}
      {entries.length > 0 && (
        <p className="mt-4 font-mono-tight text-[10px] text-zinc-950/25 dark:text-zinc-50/25">
          Export via Supabase dashboard → Table Editor → waitlist → Export CSV
        </p>
      )}
    </div>
  );
}
