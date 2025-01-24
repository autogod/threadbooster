import { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { TablesUpdate } from "@/types/database.types";

/**
 * Define the query to update a thread
 * @param threadId - The ID of the thread to update
 * @param updatedValues - An object containing the fields to update
 * @returns Supabase query to update the thread
 */
export const defineUpdateThreadQuery = (
  threadId: string,
  updatedValues: TablesUpdate<"threads">,
) => {
  const query = createClient()
    .from("threads")
    .update(updatedValues)
    .eq("id", threadId)
    .select("*");

  return query;
};

// Type for the query result
export type UpdateThread = QueryData<
  ReturnType<typeof defineUpdateThreadQuery>
>;
