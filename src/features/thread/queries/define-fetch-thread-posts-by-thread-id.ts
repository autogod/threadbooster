import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Define the query to fetch a thread
 * @param  - The ID of thread user id to fetch the thread for
 * @returns Supabase query to fetch the thread
 */
export const defineFetchThreadPostsByThreadIdQuery = (threadId: string) => {
  const query = createClient()
    .from("thread_posts")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false }); 

  return query;
};

// Type for the query result
export type FetchThreadPostsByThreadId = QueryData<
  ReturnType<typeof defineFetchThreadPostsByThreadIdQuery>
>;
