"use server";

type SuccessResponse = {
  access_token: string;
  user_id: number;
};

type ErrorResponse = {
  error_type: string;
  code: number;
  error_message: string;
};

type Response = SuccessResponse | ErrorResponse;

/**
 * Get Threads Access Token
 * @param code Authorization code from Threads OAuth
 */
export async function getThreadAccessToken(code: string): Promise<Response> {
  const THREAD_CLIENT_ID = process.env.NEXT_PUBLIC_THREAD_CLIENT_ID;
  const THREAD_CLIENT_SECRET = process.env.THREAD_CLIENT_SECRET;
  const redirectURL = `${process.env.NEXT_PUBLIC_SITE_URL}/thread/callback`;

  const response = await fetch("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: THREAD_CLIENT_ID,
      client_secret: THREAD_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectURL,
    }),
  });

  const data = await response.json();
  console.log("getThreadAccessToken -> response", data);

  if (!response.ok) {
    // Error 응답 구조
    return {
      error_type: "Failed to fetch Threads access token",
      code: response.status,
      error_message: data.error || "Unknown error",
    };
  }

  // 성공 응답 구조
  return {
    access_token: data.access_token,
    user_id: data.user_id,
  };
}
