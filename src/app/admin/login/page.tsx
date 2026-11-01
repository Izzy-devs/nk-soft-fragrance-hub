import { LoginForm } from "@/components/admin/login-form";
import { Lattice } from "@/components/site/art";
import { isSupabaseConfigured } from "@/lib/env";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 text-ivory">
      <Lattice opacity={0.08} />
      <div className="relative w-full max-w-sm">
        <h1 className="text-4xl">Store admin</h1>
        <p className="mt-2 text-ivory/70">Sign in to manage products, orders and settings.</p>
        {!isSupabaseConfigured && <p className="mt-4 border border-gold/50 p-3 text-sm">Supabase is not configured yet. Add your keys to .env.local (see .env.example).</p>}
        {error === "not-admin" && <p className="mt-4 text-red-300" role="alert">This account is not an admin account.</p>}
        <LoginForm />
      </div>
    </main>
  );
}
