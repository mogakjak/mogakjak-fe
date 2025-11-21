/**
 * JWT 토큰에서 사용자 ID를 추출하는 유틸리티 함수
 * JWT는 base64로 인코딩된 JSON이므로 디코딩하여 claims를 추출
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    // JWT는 header.payload.signature 형식
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("[JWT] 잘못된 토큰 형식");
      return null;
    }

    // payload 부분 디코딩 (base64url)
    const payload = parts[1];
    // base64url을 base64로 변환 (padding 추가)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    
    // base64 디코딩
    const decoded = atob(padded);
    const claims = JSON.parse(decoded);

    // userId 추출
    return claims.userId || null;
  } catch (error) {
    console.error("[JWT] 토큰 파싱 실패:", error);
    return null;
  }
}

