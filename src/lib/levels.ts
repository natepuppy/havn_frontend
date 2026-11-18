export const LEVELS = ["Rookie", "Pro"] as const;

export type Level = (typeof LEVELS)[number];

export function addendumName(level: string) {
  return `Havn ${level} Addendum`;
}

export function levelLabel(level: string) {
  return `${level} — ${addendumName(level)}`;
}
