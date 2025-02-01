import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { ThreadPostInsert } from "@/features/thread/types/types";

/**
 * Define the query to add (insert) a thread
 * @param newThreadPostData - The fields to insert into the "threads" table
 * @returns Supabase query to insert a new thread
 */
export const defineAddThreadPostQuery = (
  newThreadPostDatas: ThreadPostInsert[],
) => {
  const query = createClient()
    .from("thread_posts")
    .insert(newThreadPostDatas)
    .select("*"); // Insert 후 변경된 로우 반환

  return query;
};

// Type for the query result
export type AddThreadPosts = QueryData<
  ReturnType<typeof defineAddThreadPostQuery>
>;
