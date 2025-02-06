"use server";

// queries
import {
  defineFetchThreadBySlugQuery,
  FetchThread,
} from "@/features/thread/queries/define-fetch-thread-by-slug";

export async function fetchThreadBySlug(
  slug: string,
): Promise<FetchThread | null> {
  const { data, error } = await defineFetchThreadBySlugQuery(slug);

  if (error) {
    console.error("Error fetching thread:", error);
    throw new Error("Failed to fetch thread");
  }

  console.log("Thread fetched successfully:", data);
  return data; // 원하는 형태(단일 객체 vs 배열)에 맞춰 반환
}
