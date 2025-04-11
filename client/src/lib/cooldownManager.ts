// /lib/cooldownManager.ts
const cooldowns: { [key: string]: number } = {};

export function setCooldown(source: string, durationMs: number) {
  cooldowns[source] = Date.now() + durationMs;
}

export function isCooldownActive(source: string): boolean {
  return (cooldowns[source] || 0) > Date.now();
}
