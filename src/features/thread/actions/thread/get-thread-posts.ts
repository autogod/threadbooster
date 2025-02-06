"use server";

import { ThreadPostData } from "@/features/thread/types/types";
/**
 * 액세스 토큰을 이용해서 Threads 사용자의 포스트들을 가져오는 함수
 * @param accessToken - Threads access token
 * @returns ThreadPost[] - 포스트들의 배열
 * @throws Error
 */
export async function getThreadPosts(
  accessToken: string,
): Promise<ThreadPostData[]> {
  // 요청할 필드 목록 정의 (쉼표로 구분)
  const fields = [
    "id",
    "permalink",
    "owner",
    "username",
    "text",
    "timestamp",
    "shortcode",
    "thumbnail_url",
    "children",
    "is_quote_post",
  ].join(",");

  // Threads API를 호출해 포스트 데이터를 가져오기
  const response = await fetch(
    `https://graph.threads.net/v1.0/me/threads?fields=${fields}&access_token=${accessToken}`,
    { method: "GET" },
  );

  if (!response.ok) {
    console.error(
      "Failed to fetch threads posts. Status:",
      response.status,
    );
    throw new Error("Failed to fetch threads posts");
  }

  const data = await response.json();
  // 만약 API 응답이 { data: [...] } 형태라면 아래와 같이 반환하세요.
  return data.data as ThreadPostData[];
}
