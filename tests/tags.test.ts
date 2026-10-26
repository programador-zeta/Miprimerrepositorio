import test from "node:test";
import assert from "node:assert/strict";
import { validTagCode, parseTag } from "../src/lib/tags";
test("NFC accepts bounded public codes, not paths or injection", () => {
  assert.equal(validTagCode("SW0001"), true);
  for (const code of ["sw0001", "../SW0001", "SW0001'", "A".repeat(25)])
    assert.equal(validTagCode(code), false);
});
test("lookup handles missing tags and rejects corrupt status", () => {
  assert.equal(parseTag([]), null);
  assert.throws(() => parseTag([{ status: "other", username: null }]));
});
test("lookup projects only public fields for all three states", () => {
  for (const status of ["unclaimed", "active", "disabled"])
    assert.deepEqual(
      parseTag([{ status, username: null, activation_code: "secret" }]),
      { status, username: null },
    );
});
