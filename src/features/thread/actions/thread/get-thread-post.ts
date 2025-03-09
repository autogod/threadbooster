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
export async function getThreadPost(
  accessToken: string,
  thread_post_id: string,
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
  const url = new URL(`https://graph.threads.net/v1.0/me/${thread_post_id}`);
  url.searchParams.append("fields", fields);
  url.searchParams.append("access_token", accessToken);
  // 날짜 필터 옵션 추가 (있을 경우)
  const data = await response.json();

  return data;
}
