import { RefreshResponse, RefreshTokenResult } from "../../../_types/refresh";

const API_BASE = process.env.NEXT_PUBLIC_API_PROXY || "https://mogakjak.site";

export async function refreshAccessToken(
  refreshToken: string,
  accessToken?: string
): Promise<RefreshTokenResult | null> {
  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "Refresh-Token": refreshToken,
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const upstream = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!upstream.ok) {
      console.error(
        `[Token Refresh] 서버 응답 실패: ${upstream.status} ${upstream.statusText}`
      );
      return null;
    }

    // 1차: body에서 accessToken/refreshToken/expiresIn 읽기
    const result = (await upstream.json()) as
      | RefreshResponse
      | {
          data?: {
            accessToken?: string;
            refreshToken?: string;
            userInfo?: {
              expiresIn?: number;
            };
          };
        };

    const bodyAccessToken: string | undefined = result?.data?.accessToken;
    const bodyRefreshToken: string | undefined = result?.data?.refreshToken;
    const expiresInRaw: unknown = result?.data?.userInfo?.expiresIn;

    const finalAccessToken = bodyAccessToken;
    const expiresIn =
      typeof expiresInRaw === "number" && expiresInRaw > 0 ? expiresInRaw : 0;

    if (!finalAccessToken || expiresIn <= 0) {
      console.error(
        `[Token Refresh] 토큰 추출 실패: accessToken=${!!finalAccessToken}, expiresIn=${expiresIn}`
      );
      return null;
    }

    return {
      accessToken: finalAccessToken,
      refreshToken: bodyRefreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error("[Token Refresh] 예외 발생:", error);
    return null;
  }
}
