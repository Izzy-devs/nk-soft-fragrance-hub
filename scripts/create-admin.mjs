// Usage: npm run create-admin -- owner@example.com "a-strong-password"
// Creates (or reuses) a Supabase Auth user and registers it as a store admin.
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run create-admin -- email@example.com "password-with-10+-characters"');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let userId;
const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (created.error) {
  if (!/already|registered|exists/i.test(created.error.message)) {
    console.error("Could not create user:", created.error.message);
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) { console.error(error.message); process.exit(1); }
  userId = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (!userId) { console.error("User exists but could not be found."); process.exit(1); }
  await supabase.auth.admin.updateUserById(userId, { password });
} else {
  userId = created.data.user.id;
}

const { error } = await supabase.from("admin_users").upsert({ user_id: userId });
if (error) {
  console.error("Could not register admin (did you run supabase/schema.sql?):", error.message);
  process.exit(1);
}
console.log(`Admin ready: ${email}`);
