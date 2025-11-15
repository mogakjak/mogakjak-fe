function decodeBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64").toString("utf8");
  }
  if (typeof atob !== "undefined") {
    return atob(str);
  }
  throw new Error("No base64 decoder available");
}

export function getJwtExp(token?: string | null): number | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeBase64(normalized);
    const data = JSON.parse(json);

    return typeof data.exp === "number" ? data.exp : null;
  } catch {
    return null;
  }
}