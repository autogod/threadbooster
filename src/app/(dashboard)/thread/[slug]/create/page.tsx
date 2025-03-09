"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { addThreadPost } from "@/features/thread/actions/supabase/add-thread-posts";
import { fetchThreadBySlug } from "@/features/thread/actions/supabase/fetch-thread-by-slug";
import { getOpenAICompletion } from "@/features/thread/actions/openAI/get-open-ai-completion";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createAbstractPrompt } from "@/prompts/create_abstract_prompt";

interface ThreadPageProps {
  params: {
    slug: string;
  };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const optionValues = {
    "초안 작성하기": "위의 내용을 기반으로 스레드 초안을 작성해줘.",
    수정하기: "위의 내용을 더 간결하게 다듬어주세요",
  };

  const router = useRouter();
  const { slug } = params;
  const [loading, setLoading] = useState(false);
  const [leftTopContent, setLeftTopContent] = useState("");
  const [selectedOption, setSelectedOption] = useState("초안 작성하기");
  const [leftBottomContent, setLeftBottomContent] = useState(
    optionValues["초안 작성하기"]
  );
  const [error, setError] = useState(null);

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
    const prompt = createAbstractPrompt({
      reference: leftTopContent,
      user_prompt: leftBottomContent,
    });

    const content = await getOpenAICompletion({
      prompt: prompt,
    });
    try {
      const threadData = await fetchThreadBySlug(slug);
      const threadPostData = [
        {
          input: leftTopContent,
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
