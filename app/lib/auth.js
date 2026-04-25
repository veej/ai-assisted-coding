const KNOWN_USERS = {
  "admin@foyer.local": { email: "admin@foyer.local", role: "admin" },
  "user@foyer.local": { email: "user@foyer.local", role: "user" },
};

export function signIn(email) {
  if (typeof email !== "string") return null;
  return KNOWN_USERS[email.trim().toLowerCase()] ?? null;
}
