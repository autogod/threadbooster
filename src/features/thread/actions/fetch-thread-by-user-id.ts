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
    console.error("Error fetching thread:", error);
    throw new Error("Failed to fetch thread");
  }

  console.log("Thread fetched successfully:", data);
  return data; // 원하는 형태(단일 객체 vs 배열)에 맞춰 반환
}
