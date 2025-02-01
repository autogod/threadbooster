"use server";

export type LongLivedTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number; // 토큰 만료까지 남은 초(second)
};

/**
 * 유효한 long-lived 토큰을 refresh하는 함수
 * @param longLivedToken - 유효한 long-lived Threads 사용자 access token
 * @returns LongLivedTokenResponse - refresh된 long-lived 토큰 정보
 * @throws Error
 */
export async function refreshLongLivedToken(
  longLivedToken: string,
): Promise<LongLivedTokenResponse> {
  const url =
    `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${
      encodeURIComponent(
        longLivedToken,
      )
    }`;

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    console.error(
      "Failed to refresh long-lived token. Status:",
      response.status,
    );
    throw new Error("Failed to refresh long-lived token");
  }

  const data = await response.json();
  return data as LongLivedTokenResponse;
}
