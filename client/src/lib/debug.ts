// /lib/debug.ts
export const DEBUG = true;

export function logDebug(...args: any[]) {
  if (DEBUG) {
    console.log("[DEBUG]", ...args);
  }
}
