export function authDestination(next?: string): string {
  return next && /^\/activate\/[A-Z0-9]{4,24}$/.test(next)
    ? next
    : "/dashboard";
}
export function confirmationRedirect(site: string, next?: string): string {
  const url = new URL("/auth/confirm", site);
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw new Error("Invalid public site URL");
  url.searchParams.set("next", authDestination(next));
  return url.toString();
}
