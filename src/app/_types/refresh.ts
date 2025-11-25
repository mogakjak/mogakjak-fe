// 새 응답 스펙에 맞춘 타입
export interface RefreshResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    userInfo: {
      email: string;
      name: string;
      userId: string;
      tokenType: string;
      expiresIn: number; // accessToken 유효기간 (ms or s는 백엔드 기준)
    };
  };
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

