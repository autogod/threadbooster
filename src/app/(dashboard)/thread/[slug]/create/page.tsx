"use client";

import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { fetchThreadBySlug } from "@/features/thread/actions/supabase/fetch-thread-by-slug";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../../components/ui/resizable";
import { addThreadPost } from "@/features/thread/actions/supabase/add-thread-posts";

export default function ThreadPage({ params }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { slug } = params;
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const threadData = await fetchThreadBySlug(slug);
      const accessToken = threadData.thread_long_lived_token;
      const threadPostData = [
        {
          abstract: content,
          thread_id: threadData.id,
          created_at: new Date().toISOString(),
        },
      ];
      const db_result = await addThreadPost({
        threadPostDatas: threadPostData,
      });

      console.log("db_result:", db_result);

      if (!db_result) {
        throw new Error("Supabase 저장 실패");
      }
      router.push(`/thread/${slug}/create/${db_result[0].id}`);
    } catch (err) {
      console.error("Error creating thread:", err);
      setError("스레드 작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
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
              placeholder="스레드를 작성하세요..."
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} className="p-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "작성 중..." : "초안 작성하기"}
            </Button>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} className="p-4">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} className="p-4 border-b">
            <p>아직 작성된 초안이 없습니다.</p>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} className="p-4"></ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
