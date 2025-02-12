"use server";

/**
 * Long-Lived Token 응답 타입
 */
export type LongLivedTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number; // 토큰 만료까지 남은 초(second)
};

/**
 * 짧은-lived 토큰을 long-lived 토큰으로 교환하는 함수
 * @param shortLivedToken - 유효한 짧은-lived Threads 사용자 access token
 * @param clientSecret - Threads 앱 시크릿 (서버 환경 변수에서 가져옴)
 * @returns LongLivedTokenResponse - 교환된 long-lived 토큰 정보
 * @throws Error
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<LongLivedTokenResponse> {
  const clientSecret = process.env.THREAD_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("Threads App secret is not configured");
  }
  const url =
    `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${
      encodeURIComponent(
        clientSecret,
      )
    }&access_token=${encodeURIComponent(shortLivedToken)}`;

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    console.error(
      "Failed to exchange for long-lived token. Status:",
      response.status,
    );
    throw new Error("Failed to exchange for long-lived token");
  }

  const data = await response.json();
  return data as LongLivedTokenResponse;
}
