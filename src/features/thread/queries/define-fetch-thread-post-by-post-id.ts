import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Define the query to fetch a thread
 * @param  - The ID of thread user id to fetch the thread for
 * @returns Supabase query to fetch the thread
 */
export const defineFetchThreadPostByPostIdQuery = (postId: string) => {
  console.log('definepostId:', postId)
  const query = createClient()
    .from("thread_posts")
    .select("*")
    .eq("id", postId)
    .order("created_at", { ascending: false });

  return query;
};

// Type for the query result
export type FetchThreadPostByPostId = QueryData<
  ReturnType<typeof defineFetchThreadPostByPostIdQuery>
>;
