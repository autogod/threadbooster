"use client";

import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { fetchThreadBySlug } from "@/features/thread/actions/supabase/fetch-thread-by-slug";
import { fetchThreadPostsByThreadId } from "@/features/thread/actions/supabase/fetch-thread-post-by-post-id";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../../../components/ui/resizable";
import { addThreadPost } from "@/features/thread/actions/supabase/add-thread-posts";
import { createThreadPost } from "@/features/thread/actions/thread/create-thread-post";
import { finalizeThreadPost } from "@/features/thread/actions/supabase/finalize-thread-post";

export default function ThreadPage({ params }) {
  const [content, setContent] = useState("");
  const [rightContent, setRightContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postData, setPostData] = useState(null);
  const { slug, post_id } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const data = await fetchThreadPostsByThreadId({ postId: post_id });
        setPostData(data);
        setRightContent(data?.[0]?.abstract || "");
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    if (post_id) {
      fetchPostData();
    }
  }, [post_id]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }
  };

  const handleConfirm = async () => {
    try {
      const finalize_success = await finalizeThreadPost(
        postData[0].id,
        rightContent
      );

      const threadData = await fetchThreadBySlug(slug);
      const accessToken = threadData.thread_long_lived_token;
      const api_success = await createThreadPost(accessToken, rightContent);

      if (api_success) {
        console.log("확정된 내용이 성공적으로 저장되었습니다.");
        router.push(`/thread/${slug}`);
      }
    } catch (err) {
      console.error("Error confirming thread post:", err);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      <ResizablePanel defaultSize={40} className="p-4 border-r">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} className="p-4 border-b">
            <textarea
              className="w-full h-full p-2 border rounded-md resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예시) 좀 더 말투를 간결하게 해줘"
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} className="p-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "작성 중..." : "수정하기"}
            </Button>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} className="p-4">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} className="p-4 border-b">
            <textarea
              className="w-full h-full p-2 border rounded-md resize-none"
              value={rightContent}
              onChange={(e) => setRightContent(e.target.value)}
              placeholder="확정 내용을 입력하세요..ㅇ."
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} className="p-4">
            <Button onClick={handleConfirm} className="mt-2 w-full h-200">
              스레드 포스트하기
            </Button>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
