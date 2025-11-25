import { request } from "../request";

const AUTH_BASE = "/api/auth";

// 토큰 캐시 (1분간 유지)
let cachedToken: string | null | undefined = undefined;
let tokenPromise: Promise<string | null> | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 60 * 1000; // 1분

/**
 * 서버에서 인증 토큰을 가져옵니다.
 * httpOnly 쿠키는 JavaScript로 읽을 수 없으므로 API 라우트를 통해 가져옵니다.
 * 프록시를 통해 호출하여 다른 API와 일관성을 유지합니다.
 *
 * 동시에 여러 번 호출되더라도 한 번만 요청하고, 짧은 시간 동안 캐시를 유지합니다.
 */
export async function getTokenFromServer(): Promise<string | null> {
  const now = Date.now();

  // 캐시가 유효한 경우 캐시된 토큰 반환
  if (cachedToken !== undefined && now < cacheExpiry) {
    return cachedToken;
  }

  // 이미 진행 중인 요청이 있으면 그 Promise를 재사용
  if (tokenPromise) {
    return tokenPromise;
  }

  // 새로운 요청 시작
  tokenPromise = (async () => {
    try {
      const data = await request<{ token: string | null }>(
        AUTH_BASE,
        "/token",
        {
          method: "GET",
          credentials: "include", // 쿠키 포함
        }
      );
      const token = data?.token || null;

      // 캐시에 저장
      cachedToken = token;
      cacheExpiry = now + CACHE_DURATION;

      return token;
    } catch (error) {
      // 401 에러는 로그아웃 상태를 의미하므로 정상적인 경우입니다
      const isUnauthorized =
        error instanceof Error &&
        (error.message.includes("HTTP 401") || error.message.includes("401"));

      if (!isUnauthorized) {
        console.error("[WebSocket] 토큰 가져오기 실패:", error);
      }

      // 에러 발생 시 캐시 초기화 (401 포함)
      cachedToken = null; // null로 설정하여 로그아웃 상태임을 명시
      cacheExpiry = now + CACHE_DURATION; // 짧은 시간 캐시하여 불필요한 재요청 방지
      return null;
    } finally {
      // Promise 초기화 (다음 요청을 위해)
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

/**
 * 토큰 캐시를 강제로 무효화합니다.
 * 로그아웃 등 토큰이 변경되었을 때 호출합니다.
 */
export function invalidateTokenCache(): void {
  cachedToken = undefined;
  tokenPromise = null;
  cacheExpiry = 0;
}
