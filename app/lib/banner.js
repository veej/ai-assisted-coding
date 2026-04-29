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

export function setBanner({ message, accent }) {
  if (typeof message !== "string" || message.trim().length === 0) {
    throw new Error("Banner message cannot be empty");
  }
  if (!ACCENTS.includes(accent)) {
    throw new Error(`Unknown accent: ${accent}`);
  }
  localStorage.setItem(
    KEY,
    JSON.stringify({ message: message.trim(), accent }),
  );
}
