"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Finalizes a thread post by updating its abstract content.
 * @param threadId - The ID of the thread to finalize.
 * @param content - The finalized content to be updated.
 * @returns {Promise<boolean>} - Returns true if the update is successful.
 */
export async function finalizeThreadPost(postId, content) {
  const supabase = createClient();
  console.log('postID:', postId)
  const { data, error } = await supabase
    .from("thread_posts")
    .update({ content: content })
    .eq("id", postId)
    .select();

  if (error) {
    console.error("Error finalizing thread post:", error);
    throw new Error("Failed to finalize thread post");
  }

  console.log("Thread post finalized successfully:", data);
  return true;
}
