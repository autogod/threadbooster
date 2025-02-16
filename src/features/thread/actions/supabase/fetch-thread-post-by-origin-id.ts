"use server";

import {
  defineFetchThreadPostByOriginIdQuery,
  FetchThreadPostByOriginId,
} from "@/features/thread/queries/define-fetch-thread-post-by-origin-id"; // 새로 추가할 함수
import { devLog } from "@/utils/logUtils";

export async function fetchThreadPostByOriginId({
  originId,
}: {
  originId: string;
}): Promise<FetchThreadPostByOriginId | null> {
  const { data, error } = await defineFetchThreadPostByOriginIdQuery(originId);
  // devLog("fetchThreadPostByOriginId - data:", data);

  if (error) {
    // 에러 코드 'PGRST116'는 결과에 행이 없음을 의미하므로, 이를 정상 처리합니다.
    if (error.code === "PGRST116") {
      // devLog(`No thread post found for originId: ${originId}`, { error });
      return null;
    }
    // devLog("Error fetching thread:", error);
    throw new Error("Failed to fetch thread");
  }

  return data;
}
