export type TagResult = {
  status: "unclaimed" | "active" | "disabled";
  username: string | null;
};
export function validTagCode(code: string) {
  return /^[A-Z0-9]{4,24}$/.test(code);
}
export function parseTag(value: unknown): TagResult | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const row = value[0];
  if (
    !row ||
    !["unclaimed", "active", "disabled"].includes(row.status) ||
    (row.username !== null && typeof row.username !== "string")
  )
    throw new Error("INVALID_TAG_RESPONSE");
  return { status: row.status, username: row.username };
}
