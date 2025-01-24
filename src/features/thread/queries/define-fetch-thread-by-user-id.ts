import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Define the query to fetch a thread
 * @param  - The ID of thread user id to fetch the thread for
 * @returns Supabase query to fetch the thread
 */
export const defineFetchThreadByUserIdQuery = (userId: string) => {
  const query = createClient()
    .from("threads")
    .select("*")
    .eq("thread_user_id", userId)
    .single();

  return query;
};

// Type for the query result
export type FetchThread = QueryData<
  ReturnType<typeof defineFetchThreadByUserIdQuery>
>;
