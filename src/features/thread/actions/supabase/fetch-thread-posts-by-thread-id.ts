"use server";

import { defineFetchThreadPostsByThreadIdQuery, FetchThreadPostsByThreadId } from "@/features/thread/queries/define-fetch-thread-posts-by-thread-id"; // 새로 추가할 함수

export async function fetchThreadPostsByThreadId({
  threadId,
}: {
    threadId: string;
}): Promise<FetchThreadPostsByThreadId> {
  console.log('threadId:', threadId)
  const { data, error } = await defineFetchThreadPostsByThreadIdQuery(threadId);
  console.log('data:', data)
  if (error) {
    console.error("Error fetching thread:", error);
    throw new Error("Failed to fetch thread");
  }

  // 조회된 데이터가 없거나, 기대하는 형태가 아닐 때 처리
  if (!data || data.length === 0) {
    throw new Error("Thread not found");
  }

  console.log("Thread fetched successfully:", data);
  return data; // 원하는 형태(단일 객체 vs 배열)에 맞춰 반환
}
