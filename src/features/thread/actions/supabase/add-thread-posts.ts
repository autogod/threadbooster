"use server";

import {
    AddThreadPosts,
    defineAddThreadPostQuery,
} from "@/features/thread/queries/define-add-thread-posts";
import { ThreadPostInsert } from "@/features/thread/types/types";
import { fetchThreadBySlug } from "@/features/thread/actions/supabase/fetch-thread-by-slug";

/**
 * 새로운 thread post를 생성하는 액션
 * @param threadPostData - "thread_posts" 테이블에 삽입할 데이터를 담은 객체
 * @returns 삽입된 thread post 데이터 (AddThreadPost 타입) 또는 오류 발생 시 에러를 throw
 */
export async function addThreadPost({
    threadPostDatas,
}: {
    threadPostDatas: ThreadPostInsert[];
}): Promise<AddThreadPosts> {
    // thread post 추가 (쿼리 함수 호출)
    const { data, error } = await defineAddThreadPostQuery(threadPostDatas);

    if (error) {
        console.error("Error adding thread post:", error);
        throw new Error("Failed to add thread post");
    }

    console.log("Thread post added successfully:", data);
    return data;
}
