"use server";

// queries
import {
  defineUpdateThreadQuery,
  UpdateThread,
} from "@/features/thread/queries/define-update-threads";
// types
import { ThreadUpdate } from "@/features/thread/types/types";

/**
 * Action to update an existing thread
 * @param threadId - The ID of the thread to update
 * @param threadData - The object containing properties to update
 * @returns Updated thread data or throws an error if it occurs
 */
export async function updateThread({
  threadId,
  threadData,
}: {
  threadId: string;
  threadData: ThreadUpdate;
}): Promise<UpdateThread> {
  // 스레드 업데이트
  const { data, error } = await defineUpdateThreadQuery(threadId, threadData);

  if (error) {
    console.error("Error updating thread:", error);
    throw new Error("Failed to update thread");
  }

  if (!data || data.length === 0) {
    throw new Error("No thread found to update or no rows returned.");
  }

  console.log("Thread updated successfully:", data);
  return data;
}
