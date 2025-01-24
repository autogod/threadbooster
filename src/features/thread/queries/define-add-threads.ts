import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "@/types/database.types";

/**
 * Define the query to add (insert) a thread
 * @param newThreadData - The fields to insert into the "threads" table
 * @returns Supabase query to insert a new thread
 */
export const defineAddThreadQuery = (
  newThreadData: TablesInsert<"threads">,
) => {
  const query = createClient()
    .from("threads")
    .insert(newThreadData)
    .select("*"); // Insert 후 변경된 로우 반환

  return query;
};

// Type for the query result
export type AddThread = QueryData<ReturnType<typeof defineAddThreadQuery>>;
