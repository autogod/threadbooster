"use server";

import { fetchThreadBySlug } from "@/features/thread/actions/supabase/fetch-thread-by-slug";
import { fetchThreadPostsByThreadId } from "@/features/thread/actions/supabase/fetch-thread-posts-by-thread-id";

export async function fetchThreadPosts({ slug }: { slug: string }) {
  try {
    // 'thread_id' 가져오기
    const threadData = await fetchThreadBySlug(slug);

    if (!threadData || !threadData.id) {
      throw new Error("Thread not found");
    }

    // console.log("Thread fetched successfully. ID:", threadData.id);

    // 'thread_id'를 기반으로 `thread_posts` 가져오기
    const posts = await fetchThreadPostsByThreadId({ threadId: threadData.id });

    return posts;
  } catch (error) {
    console.error("Error fetching thread or posts:", error);
    throw new Error("Failed to fetch thread posts");
  }
}
