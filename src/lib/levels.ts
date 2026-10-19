export const LEVELS = ["Rookie", "Veteran", "Pro"] as const;

export type Level = (typeof LEVELS)[number];

export function addendumName(level: string) {
  return `Havn ${level} Addendum`;
}

export function levelLabel(level: string) {
  return `${level} — ${addendumName(level)}`;
}
