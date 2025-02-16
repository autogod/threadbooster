import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { ThreadPostUpdate } from "@/features/thread/types/types";

/**
 * Define the query to update a thread
 * @param updatedThreadPostData - The fields to update into the "threads" table
 * @returns Supabase query to insert a new thread
 */
export const defineUpdateThreadPostByIdQuery = (
  postId: string,
  updatedThreadPostData: ThreadPostUpdate,
) => {
  const query = createClient()
    .from("thread_posts")
    .update(updatedThreadPostData)
    .eq("id", postId)
    .select("*")
    .single(); // Update 후 변경된 로우 반환

  return query;
};

// Type for the query result
export type UpdateThreadPostById = QueryData<
  ReturnType<typeof defineUpdateThreadPostByIdQuery>
>;
