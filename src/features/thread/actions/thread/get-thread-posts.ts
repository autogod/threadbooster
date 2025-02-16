"use server";

import { ThreadPostData } from "@/features/thread/types/types";

/**
 * 액세스 토큰을 이용해서 Threads 사용자의 포스트들을 페이징 처리하여 모두 가져오는 함수
 * @param accessToken - Threads access token
 * @param since - 시작 날짜 (YYYY-MM-DD). 옵션
 * @param until - 종료 날짜 (YYYY-MM-DD). 옵션
 * @returns ThreadPostData[] - 포스트들의 배열
 * @throws Error
 */
export async function getThreadPosts(
  accessToken: string,
  since?: string,
  until?: string,
): Promise<ThreadPostData[]> {
  // 요청할 필드 목록 (쉼표로 구분)
  const fields = [
    "id",
    "media_product_type",
    "media_type",
    "media_url",
    "permalink",
    "owner",
    "username",
    "text",
    "timestamp",
    "shortcode",
    "thumbnail_url",
    "children",
    "is_quote_post",
    "quoted_post",
    "reposted_post",
    "alt_text",
    "link_attachment_url",
    "gif_url",
  ].join(",");

  const allPosts: ThreadPostData[] = [];

  // 기본 URL 생성 (URLSearchParams 활용)
  const url = new URL("https://graph.threads.net/v1.0/me/threads");
  url.searchParams.append("fields", fields);
  url.searchParams.append("access_token", accessToken);
  // 날짜 필터 옵션 추가 (있을 경우)
  if (since) url.searchParams.append("since", since);
  if (until) url.searchParams.append("until", until);
  // 한 번에 가져올 포스트 수 (API에서 허용하는 범위 내 설정)
  url.searchParams.append("limit", "50");

  let hasNextPage = true;
  while (hasNextPage) {
    console.log("Fetching posts from:", url.toString());
    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      console.error("Failed to fetch threads posts. Status:", response.status);
      throw new Error("Failed to fetch threads posts");
    }

    const data = await response.json();
    // console.log("Fetched data:", data);

    if (data.data && Array.isArray(data.data)) {
      allPosts.push(...(data.data as ThreadPostData[]));
    }

    // 페이징 처리: response에 paging.cursors.after가 있으면 다음 페이지 요청
    if (data.paging && data.paging.cursors && data.paging.cursors.after) {
      url.searchParams.set("after", data.paging.cursors.after);
    } else {
      hasNextPage = false;
    }
  }

  console.log("Total posts fetched:", allPosts.length);
  return allPosts;
}
