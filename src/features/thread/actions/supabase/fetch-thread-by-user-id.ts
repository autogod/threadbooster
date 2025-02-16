"use server";

// queries
import {
  defineFetchThreadByUserIdQuery,
  FetchThread,
} from "@/features/thread/queries/define-fetch-thread-by-user-id";

export async function fetchThreadByUserId(
  userId: string,
): Promise<FetchThread | null> {
  const { data, error } = await defineFetchThreadByUserIdQuery(userId);

  if (error) {
    // Supabase 에러 코드 PGRST116는 "JSON object requested, multiple (or no) rows returned" 에러로,
    // 0개의 행이 반환되었거나 여러 행이 반환되었을 때 발생합니다.
    if (error.code === "PGRST116") {
      console.warn("No thread found for userId:", userId);
      return null;
    }
    console.error("Error fetching thread:", error);
    throw new Error("Failed to fetch thread");
  }

  // console.log("Thread fetched successfully:", data);
  return data;
}
