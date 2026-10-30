import { test } from "node:test";
import assert from "node:assert/strict";
import { validMedia, validateMediaFile, experienceMedia } from "../src/lib/experience-media";
const owner = "6be60924-b245-43ee-b903-6ac59bedac11";
const image = { path: owner + "/217a34c8-c3a7-4fc5-b035-d207649f95ad.jpg", kind: "image" as const };
const video = { path: owner + "/ecbb80d5-5bea-48f2-af8c-f6efefdfb77f.webm", kind: "video" as const };
test("media limits accept videos while rejecting unsupported types and invalid sizes", () => {
  assert.equal(validateMediaFile("image/jpeg", 5 * 1024 * 1024), null);
  assert.equal(validateMediaFile("video/mp4", 25 * 1024 * 1024), null);
  for (const [type, size] of [["image/jpeg", 5 * 1024 * 1024 + 1], ["video/mp4", 25 * 1024 * 1024 + 1], ["image/svg+xml", 10], ["constructor", 10], ["__proto__", 10], ["video/webm", 0], ["video/webm", NaN]] as const) assert.ok(validateMediaFile(type, size));
});
test("gallery validation rejects foreign paths, traversal, duplicates and excess files", () => {
  assert.equal(validMedia([image, video], owner), true);
  for (const items of [null, {}, [video,video], Array(11).fill(video), [{ ...image, path: "another-owner/file.jpg" }], [{ ...image, path: owner + "/../file.jpg" }], [{ ...video, kind: "image" }]]) assert.equal(validMedia(items, owner), false);
});
test("existing cover photos remain visible and video-only galleries do not need a cover", () => {
  assert.deepEqual(experienceMedia({ photo_url: image.path }), [image]);
  assert.deepEqual(experienceMedia({ photo_url: null, media: [video] }), [video]);
});
