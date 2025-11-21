function decodeBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64").toString("utf8");
  }
  if (typeof atob !== "undefined") {
    return atob(str);
  }
  throw new Error("No base64 decoder available");
}

/**
 * JWT 토큰의 payload를 디코딩하여 반환합니다.
 */
export function decodeJwtPayload(
  token?: string | null
): Record<string, unknown> | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeBase64(normalized);
    const data = JSON.parse(json);

    return data || null;
  } catch {
    return null;
  }
}

export function getJwtExp(token?: string | null): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return typeof payload.exp === "number" ? payload.exp : null;
}

/**
 * JWT 토큰에서 userId를 추출합니다.
 */
export function getUserIdFromToken(token?: string | null): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // JWT payload에서 userId 또는 sub (subject) 필드를 확인
  const userId = payload.userId || payload.sub || payload.id;
  return typeof userId === "string" ? userId : null;
}
