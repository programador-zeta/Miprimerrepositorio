import test from "node:test";
import assert from "node:assert/strict";
import {
  authDestination,
  confirmationRedirect,
} from "../src/lib/auth-navigation";
test("signup preserves the NFC destination but rejects external redirects", () => {
  assert.equal(authDestination("/activate/SW0001"), "/activate/SW0001");
  for (const path of [
    "//example.com",
    "https://example.com",
    "/activate/../dashboard",
    "/dashboard?unsafe=1",
  ])
    assert.equal(authDestination(path), "/dashboard");
});
test("confirmation links target the deployed site rather than localhost", () => {
  const url = new URL(
    confirmationRedirect(
      "https://somewhere-tag.onrender.com",
      "/activate/SW0001",
    ),
  );
  assert.equal(url.origin, "https://somewhere-tag.onrender.com");
  assert.equal(url.pathname, "/auth/confirm");
  assert.equal(url.searchParams.get("next"), "/activate/SW0001");
  assert.throws(() => confirmationRedirect("http://example.com"));
});
