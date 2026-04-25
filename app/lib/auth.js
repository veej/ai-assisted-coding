const KNOWN_USERS = {
  "admin@foyer.local": {
    email: "admin@foyer.local",
    role: "admin",
    password: "admin",
  },
  "user@foyer.local": {
    email: "user@foyer.local",
    role: "user",
    password: "user",
  },
};

export function signIn(email, password) {
  if (typeof email !== "string" || typeof password !== "string") return null;
  const record = KNOWN_USERS[email.trim().toLowerCase()];
  if (!record || record.password !== password) return null;
  return { email: record.email, role: record.role };
}
