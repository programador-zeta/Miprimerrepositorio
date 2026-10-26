import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
const cfg = JSON.parse(
  execFileSync(".local-tools/supabase", ["status", "-o", "json"], {
    stdio: ["ignore", "pipe", "ignore"],
    encoding: "utf8",
  }),
);
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(cfg.API_URL, cfg.SERVICE_ROLE_KEY, opts);
const anon = createClient(cfg.API_URL, cfg.ANON_KEY, opts);
const suffix = Date.now().toString(36);
let owner, other;
const codes = [
  "ST" + suffix.toUpperCase() + "A",
  "ST" + suffix.toUpperCase() + "D",
];
try {
  const existing = await anon.rpc("resolve_tag", { code: "SW0001" });
  assert.equal(existing.error, null);
  assert.equal(existing.data[0].status, "unclaimed");
  assert.deepEqual(Object.keys(existing.data[0]).sort(), [
    "status",
    "username",
  ]);
  console.log(
    "PASS: SW0001 lookup is real, unclaimed, and exposes only public fields",
  );
  const hidden = await anon.from("tags").select("activation_code");
  assert.ok(hidden.error);
  const scans = await anon.from("tag_scans").select("*");
  assert.ok(scans.error);
  console.log(
    "PASS: anonymous clients cannot read activation secrets or scan history",
  );
  const create = async (label) => {
    const email = `${label}-${suffix}@example.test`;
    const password = `Test-${crypto.randomUUID()}!`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.equal(error, null);
    const client = createClient(cfg.API_URL, cfg.ANON_KEY, opts);
    const signed = await client.auth.signInWithPassword({ email, password });
    assert.equal(signed.error, null);
    return { id: data.user.id, client };
  };
  owner = await create("owner");
  other = await create("other");
  const username = "test_" + suffix;
  assert.equal(
    (
      await owner.client
        .from("profiles")
        .update({ username, name: "Integration test" })
        .eq("user_id", owner.id)
    ).error,
    null,
  );
  const seed = await admin
    .from("tags")
    .select("activation_code")
    .eq("public_code", "SW0001")
    .single();
  assert.equal(seed.error, null);
  assert.equal(
    (
      await admin
        .from("tags")
        .insert(
          codes.map((public_code, i) => ({
            public_code,
            activation_code: seed.data.activation_code,
            status: i ? "disabled" : "unclaimed",
          })),
        )
    ).error,
    null,
  );
  for (const secret of [null, "", "wrong-code"])
    assert.ok(
      (await owner.client.rpc("claim_tag", { code: codes[0], secret })).error,
    );
  assert.equal(
    (
      await owner.client.rpc("claim_tag", {
        code: codes[0],
        secret: "LOCAL-SW-2026",
      })
    ).error,
    null,
  );
  assert.ok(
    (
      await other.client.rpc("claim_tag", {
        code: codes[0],
        secret: "LOCAL-SW-2026",
      })
    ).error,
  );
  console.log(
    "PASS: authenticated claim rejects null/wrong codes and repeat claims",
  );
  const resolved = await anon.rpc("resolve_tag", { code: codes[0] });
  assert.deepEqual(resolved.data, [{ status: "active", username }]);
  assert.equal(
    (await anon.rpc("resolve_tag", { code: codes[1] })).data[0].status,
    "disabled",
  );
  assert.deepEqual(
    (await anon.rpc("resolve_tag", { code: "NOTFOUND123" })).data,
    [],
  );
  const unauthorized = await other.client
    .from("profiles")
    .update({ name: "changed" })
    .eq("user_id", owner.id)
    .select();
  assert.deepEqual(unauthorized.data, []);
  const unchanged = await owner.client
    .from("profiles")
    .select("name")
    .eq("user_id", owner.id)
    .single();
  assert.equal(unchanged.data.name, "Integration test");
  const ownerSecret = await owner.client.from("tags").select("activation_code");
  assert.ok(ownerSecret.error);
  console.log("PASS: all tag states, missing tags, and cross-user RLS");
  const before = await admin
    .from("tag_scans")
    .select("id", { count: "exact", head: true });
  await anon.rpc("resolve_tag", { code: codes[0] });
  const after = await admin
    .from("tag_scans")
    .select("id", { count: "exact", head: true });
  assert.ok(after.count > before.count);
  console.log("PASS: scans recorded without location");
  assert.ok(
    (await anon.rpc("set_tag_enabled", { code: codes[0], enabled: false }))
      .error,
  );
  assert.ok(
    (
      await other.client.rpc("set_tag_enabled", {
        code: codes[0],
        enabled: false,
      })
    ).error,
  );
  assert.equal(
    (
      await owner.client.rpc("set_tag_enabled", {
        code: codes[0],
        enabled: false,
      })
    ).error,
    null,
  );
  assert.equal(
    (await anon.rpc("resolve_tag", { code: codes[0] })).data[0].status,
    "disabled",
  );
  assert.equal(
    (
      await owner.client.rpc("set_tag_enabled", {
        code: codes[0],
        enabled: true,
      })
    ).error,
    null,
  );
  assert.equal(
    (
      await owner.client
        .from("emergency_profiles")
        .insert({ user_id: owner.id, notes: "Integration test only" })
    ).error,
    null,
  );
  assert.equal(
    (
      await anon
        .from("emergency_profiles")
        .select("notes")
        .eq("user_id", owner.id)
        .single()
    ).data.notes,
    "Integration test only",
  );
  assert.deepEqual(
    (
      await other.client
        .from("emergency_profiles")
        .update({ notes: "unauthorized" })
        .eq("user_id", owner.id)
        .select()
    ).data,
    [],
  );
  const makeExperience = (visibility) => ({
    user_id: owner.id,
    type: "hike",
    name: "Integration " + visibility,
    place: "Test",
    experience_date: "2026-01-01",
    visibility,
  });
  assert.equal(
    (
      await owner.client
        .from("experiences")
        .insert([makeExperience("private"), makeExperience("public")])
    ).error,
    null,
  );
  assert.equal(
    (await anon.from("experiences").select("name").eq("user_id", owner.id)).data
      .length,
    1,
  );
  assert.equal(
    (
      await owner.client
        .from("experiences")
        .select("name")
        .eq("user_id", owner.id)
    ).data.length,
    2,
  );
  assert.deepEqual(
    (
      await other.client
        .from("experiences")
        .update({ name: "unauthorized" })
        .eq("user_id", owner.id)
        .select()
    ).data,
    [],
  );
  assert.ok(
    (await other.client.from("experiences").insert(makeExperience("public")))
      .error,
  );
  const photoAttack = {
    ...makeExperience("public"),
    user_id: other.id,
    photo_url: owner.id + "/private-photo.jpg",
  };
  assert.ok((await other.client.from("experiences").insert(photoAttack)).error);
  console.log(
    "PASS: tag administration, emergency RLS, private experiences, and foreign-photo protection",
  );
  const base = process.env.APP_URL || "http://127.0.0.1:3000";
  for (const [path, text] of [
    ["/", "Tu historia."],
    ["/t/SW0001", "Activar mi tag"],
    [`/t/${codes[1]}`, "Este Somewhere Tag no está disponible."],
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(text));
  }
  const active = await fetch(`${base}/t/${codes[0]}`, { redirect: "manual" });
  assert.equal(active.status, 307);
  assert.equal(active.headers.get("location"), "/u/" + username);
  const missing = await fetch(base + "/t/NOTFOUND123");
  assert.equal(missing.status, 404);
  console.log("PASS: HTTP home, unclaimed, disabled, active redirect, and 404");
} finally {
  await admin.from("tags").delete().in("public_code", codes);
  for (const u of [owner, other])
    if (u) await admin.auth.admin.deleteUser(u.id);
}
