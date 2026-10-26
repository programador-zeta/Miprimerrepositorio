import { readFileSync, writeFileSync, existsSync } from "node:fs";
const status = JSON.parse(readFileSync(0, "utf8"));
if (!status.API_URL || !status.ANON_KEY)
  throw new Error("Local Supabase is not ready");
if (existsSync(".env.local")) {
  console.log(".env.local already exists; preserved.");
} else {
  writeFileSync(
    ".env.local",
    `SUPABASE_URL=${status.API_URL}\nSUPABASE_ANON_KEY=${status.ANON_KEY}\n`,
    { mode: 0o600 },
  );
  console.log("Local Supabase connection saved to .env.local (values hidden).");
}
