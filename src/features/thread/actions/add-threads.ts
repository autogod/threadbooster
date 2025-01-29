"use server";

import { createClient } from "@/utils/supabase/server";
// queries
import {
  AddThread,
  defineAddThreadQuery,
} from "@/features/thread/queries/define-add-threads";
// types
import { ThreadInsert } from "@/features/thread/types/types";

/**
 * Action to create a new thread
 * @param threadData - Object containing properties to insert into "threads" table
 * @param revalidateTargetPath - (Optional) The path to revalidate after adding the thread
 * @returns The inserted thread data or throws an error if it occurs
 */
export async function addThread({
  threadData,
}: {
  threadData: ThreadInsert;
}): Promise<AddThread> {
  // 예: slug가 필요하다면, 다음과 같이 중복 검사
  if (threadData.slug) {
    const { data: existingThread, error: fetchError } = await createClient()
      .from("threads")
      .select("id")
      .eq("slug", threadData.slug)
      .single();

    // 만약 fetchError가 치명적 에러라면 throw
    // code === "PGRST116"는 "No rows found" 에러이므로, 없어도 괜찮은 경우
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking thread slug uniqueness:", fetchError);
      throw new Error("Failed to check thread slug uniqueness");
    }

    // 이미 존재한다면 에러
    if (existingThread) {
      throw new Error(
        "The thread slug is already in use. Please choose another.",
      );
    }
  }

  // 스레드 추가
  const { data, error } = await defineAddThreadQuery(threadData);

  if (error) {
    console.error("Error adding thread:", error);
    throw new Error("Failed to add thread");
  }

  console.log("Thread added successfully:", data);
  return data; // 삽입된 스레드 데이터 반환
}
