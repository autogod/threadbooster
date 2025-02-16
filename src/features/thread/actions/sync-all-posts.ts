"use server";

// actions
import { getThreadPosts } from "@/features/thread/actions/thread/get-thread-posts";
import { addThreadPost } from "@/features/thread/actions/supabase/add-thread-posts";
import { updateThreadPost } from "@/features/thread/actions/supabase/update-thread-posts";
// types
import {
  ThreadPostData,
  ThreadPostInsert,
} from "@/features/thread/types/types";
import { fetchThreadPostByOriginId } from "@/features/thread/actions/supabase/fetch-thread-post-by-origin-id";
import { THREAD_POST_TYPE } from "@/features/thread/types/types";
// utils
import { devLog } from "@/utils/logUtils";

/**
 * Threads API로부터 모든 포스트를 가져와서 DB와 동기화합니다.
 *
 * @param threadId - DB의 threads 테이블에서 해당 스레드의 id
 * @param accessToken - Threads API 호출에 사용할 access token
 * @throws Error 동기화 중 오류가 발생하면 예외를 던집니다.
 */
export async function syncAllPosts(
  threadId: string,
  accessToken: string,
): Promise<void> {
  try {
    devLog("syncAllPosts 시작", { threadId });

    // 1. Threads API에서 포스트 전체를 가져옵니다.
    devLog("getThreadPosts 호출 중...");
    const posts: ThreadPostData[] = await getThreadPosts(accessToken);
    // devLog("Posts fetched successfully", posts);

    // 2. 각 포스트를 순회하며 DB에 동기화합니다.
    for (const post of posts) {
      devLog(`처리 중인 포스트 origin_id: ${post.id}`);

      // 해당 포스트에 대해 삽입 데이터를 개별 생성
      const postType = post.is_quote_post
        ? THREAD_POST_TYPE.QUOTE
        : post.reposted_post
        ? THREAD_POST_TYPE.REPOST
        : THREAD_POST_TYPE.TEXT_POST;
      const insertionData: ThreadPostInsert = {
        content: post.text,
        origin_id: post.id,
        raw_data: post,
        thread_id: threadId,
        thread_created_at: new Date(post.timestamp).toISOString(),
        post_type: postType,
      };

      // DB에서 해당 포스트가 이미 존재하는지 확인합니다.
      const existingPost = await fetchThreadPostByOriginId({
        originId: post.id,
      });
      // devLog(`DB 검색 결과 for origin_id ${post.id}`, { existingPost });

      if (!existingPost) {
        devLog(`포스트가 존재하지 않음 - 추가 진행 for origin_id: ${post.id}`);
        await addThreadPost({
          threadPostDatas: [insertionData],
        });
        devLog(`포스트 추가 완료 for origin_id: ${post.id}`);
      } else {
        devLog(
          `포스트가 이미 존재함 - 업데이트 진행 for origin_id: ${post.id}`,
        );
        const updateData = {
          content: post.text,
          raw_data: post,
          thread_created_at: new Date(post.timestamp).toISOString(),
          post_type: postType,
        };
        await updateThreadPost({
          postId: existingPost.id,
          threadPostData: updateData,
        });
        devLog(`포스트 업데이트 완료 for origin_id: ${post.id}`);
      }
    }

    devLog("syncAllPosts: 모든 포스트 동기화 완료");
  } catch (error) {
    devLog("syncAllPosts: 동기화 중 오류 발생", error);
    throw error;
  }
}
