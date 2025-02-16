import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Define the query to fetch a thread
 * @param  - The ID of thread user id to fetch the thread for
 * @returns Supabase query to fetch the thread
 */
export const defineFetchThreadPostByOriginIdQuery = (originId: string) => {
  const query = createClient()
    .from("thread_posts")
    .select("*")
    .eq("origin_id", originId)
    .single();

  return query;
};

// Type for the query result
export type FetchThreadPostByOriginId = QueryData<
  ReturnType<typeof defineFetchThreadPostByOriginIdQuery>
>;
