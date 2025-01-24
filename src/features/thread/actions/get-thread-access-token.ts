"use server";

type Response = {
  access_token: string;
  user_id: number;
  error_type?: string;
  code?: number;
  error_message?: string;
};

export async function getThreadAccessToken(code: string): Promise<Response> {
  const THREAD_CLIENT_ID = process.env.NEXT_PUBLIC_THREAD_CLIENT_ID;
  const THREAD_CLIENT_SECRET = process.env.THREAD_CLIENT_SECRET;
  const redirectURL = `${process.env.NEXT_PUBLIC_SITE_URL}/thread/callback`;
  const response = await fetch(
    "https://graph.threads.net/oauth/access_token",
    {
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
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch access token");
  }

  return response.json();
}
