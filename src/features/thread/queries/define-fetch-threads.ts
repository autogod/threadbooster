import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Define the query to fetch a project
 * @param  - The ID of profile to fetch the project for
 * @returns Supabase query to fetch the thread
 */
export const defineFetchThreadsQuery = (profileId: string) => {
  const query = createClient()
    .from("threads")
    .select("*")
    .eq("owner_profile_id", profileId);

  return query;
};

// Type for the query result
export type FetchThreads = QueryData<
  ReturnType<typeof defineFetchThreadsQuery>
>;
