"use client";

import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { fetchThreadBySlug } from "@/features/thread/actions/supabase/fetch-thread-by-slug";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../../components/ui/resizable";
import { addThreadPost } from "@/features/thread/actions/supabase/add-thread-posts";
import { getOpenAICompletion } from "@/features/thread/actions/openAI/get-open-ai-completion";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ThreadPage({ params }) {
  const optionValues = {
    "초안 작성하기": "위의 내용을 기반으로 스레드 초안을 작성해주세요.",
    수정하기: "위의 내용을 더 간결하게 다듬어주세요",
  };

  const [leftTopContent, setLeftTopContent] = useState("");
  const [selectedOption, setSelectedOption] = useState("초안 작성하기");
  const [leftBottomContent, setLeftBottomContent] = useState(
    optionValues["초안 작성하기"]
  );
  const [rightContent, setRightContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { slug } = params;
  const router = useRouter();

  useEffect(() => {
    setLeftBottomContent(optionValues[selectedOption] || "");
  }, [selectedOption]);

  const handleOptionChange = (value) => {
    setSelectedOption(value);
  };

  const handleSubmit = async () => {
    if (!leftTopContent.trim() && !leftBottomContent.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    const content = await getOpenAICompletion({
      prompt: leftTopContent + "\n" + leftBottomContent,
    });
    console.log("content", content);
    console.log("content", content);
    console.log("content", content);
    console.log("content", content);
    console.log("content", content);
    console.log("content", content);
    console.log("content", content);
    try {
      const threadData = await fetchThreadBySlug(slug);
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
          <ResizablePanel defaultSize={50} className="p-4 border-b">
            <textarea
              className="w-full h-full p-2 border rounded-md resize-none"
              value={leftTopContent}
              onChange={(e) => setLeftTopContent(e.target.value)}
              placeholder="게시글, 키워드, 등 초안에 필요한 정보를 기입해주세요."
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} className="p-4 border-b">
            <Select value={selectedOption} onValueChange={handleOptionChange}>
              <SelectTrigger className="w-full">
                <span>{selectedOption}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(optionValues).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <textarea
              className="w-full h-24 mt-2 p-2 border rounded-md resize-none"
              value={leftBottomContent}
              onChange={(e) => setLeftBottomContent(e.target.value)}
            />
          </ResizablePanel>
          <ResizablePanel defaultSize={20} className="p-4 flex justify-start">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full md:w-auto px-6"
            >
              {loading ? "작성 중..." : "초안 작성하기"}
            </Button>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} className="p-4">
        <p>아직 작성된 초안이 없습니다.</p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
