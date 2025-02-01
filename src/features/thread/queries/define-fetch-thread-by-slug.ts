import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Define the query to fetch a thread
 * @param  - The ID of thread user id to fetch the thread for
 * @returns Supabase query to fetch the thread
 */
export const defineFetchThreadBySlugQuery = (slug: string) => {
  const query = createClient()
    .from("threads")
    .select("*")
    .eq("slug", slug)
    .single();

  return query;
};

// Type for the query result
export type FetchThread = QueryData<
  ReturnType<typeof defineFetchThreadByUserIdQuery>
>;
