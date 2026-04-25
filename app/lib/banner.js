const KEY = "foyer.banner";

export const ACCENTS = ["sky", "amber", "emerald", "rose"];

const DEFAULT = { message: "Welcome to Foyer", accent: "sky" };

export function getBanner() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return DEFAULT;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.message !== "string") return DEFAULT;
    if (!ACCENTS.includes(parsed?.accent)) return DEFAULT;
    return parsed;
  } catch {
    return DEFAULT;
  }
}
