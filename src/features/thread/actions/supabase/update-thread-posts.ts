"use server";

import {
  defineUpdateThreadPostByIdQuery,
  UpdateThreadPostById,
} from "@/features/thread/queries/define-update-thread-posts";
import { ThreadPostUpdate } from "@/features/thread/types/types";

/**
 * 기존 thread post를 업데이트하는 액션
 * @param threadPostDatas - "thread_posts" 테이블에 업데이트할 데이터를 담은 객체 배열
 * @returns 업데이트된 thread post 데이터 (UpdateThreadPosts 타입) 또는 오류 발생 시 에러를 throw
 */
export async function updateThreadPost({
  postId,
  threadPostData,
}: {
  postId: string;
  threadPostData: ThreadPostUpdate;
}): Promise<UpdateThreadPostById> {
  // thread post 업데이트 (쿼리 함수 호출)
  const { data, error } = await defineUpdateThreadPostByIdQuery(
    postId,
    threadPostData,
  );

  if (error) {
    // console.error("Error updating thread post:", error);
    throw new Error("Failed to update thread post");
  }

  // console.log("Thread post updated successfully:", data);
  return data;
}
