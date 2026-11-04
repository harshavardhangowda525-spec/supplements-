import { Database, KeyRound, UserCog, Upload } from "lucide-react";

const STEPS = [
  { icon: Database, title: "Create a Supabase project", body: "Run supabase/schema.sql in the SQL editor (tables, RLS policies, storage bucket). Optionally run supabase/seed.sql for the demo catalogue." },
  { icon: KeyRound, title: "Add environment variables", body: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example) locally and in Vercel. No service-role key is needed." },
  { icon: UserCog, title: "Create the owner account", body: "Add a user in Supabase → Authentication, then insert their user id into public.admin_users." },
  { icon: Upload, title: "Add the real catalogue", body: "Sign in here to add products, prices, stock, photos and verified label information." },
];

export function SetupNotice() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5 text-sm text-amber-100/90">
        <strong className="text-amber-200">Demo mode.</strong> Supabase isn’t connected, so the store is showing the
        bundled sample catalogue and the admin dashboard can’t sign in or save changes yet.
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="metal-border rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-lime/10 text-lime">
                <Icon className="size-5" />
              </span>
              <span className="font-heading text-xs text-white/60">STEP {i + 1}</span>
            </div>
            <h3 className="mt-4 font-heading font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-mist">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
