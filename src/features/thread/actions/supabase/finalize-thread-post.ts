"use server";

import { createClient } from "@/utils/supabase/server";
import { getThreadPost } from "@/features/thread/actions/thread/get-thread-post"
/**
 * Finalizes a thread post by updating its abstract content.
 * @param threadId - The ID of the thread to finalize.
 * @param content - The finalized content to be updated.
 * @returns {Promise<boolean>} - Returns true if the update is successful.
 */
export async function finalizeThreadPost(postId, content, origin_id) {
  const supabase = createClient();
  console.log('postID:', postId)
  console.log('origin_id:', origin_id)
  const { data, error } = await supabase
    .from("thread_posts")
    .update({ content: content, origin_id: origin_id })
    .eq("id", postId)
    .select();

  if (error) {
    console.error("Error finalizing thread post:", error);
    throw new Error("Failed to finalize thread post");
  }

  console.log("Thread post finalized successfully:", data);
  return true;
}
