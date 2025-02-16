// page.tsx (서버 컴포넌트)
import React from "react";
import { ThreadPostTable } from "@/features/thread/components/thread-post-table";
import { fetchThreadPosts } from "@/features/thread/actions/supabase/fetch-thread-posts";
import type {
  ThreadPostWithExactRawData,
  ThreadPostData,
  ThreadPost,
} from "@/features/thread/types/types";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!slug) {
    return <div>Slug not found</div>;
  }
  const posts: ThreadPost[] = await fetchThreadPosts({ slug });

  // posts의 raw_data (Json | null)을 ThreadPostData | null 로 변환하여 타입을 맞춤
  const mappedPosts: ThreadPostWithExactRawData[] = posts.map((post) => ({
    ...post,
    raw_data: post.raw_data ? (post.raw_data as ThreadPostData) : null,
  }));

  return (
    <main className="min-h-screen w-full p-4">
      <h1 className="text-center text-2xl font-bold mb-4">
        스레드 게시글 리스트
      </h1>
      <ThreadPostTable posts={mappedPosts} />
    </main>
  );
}
