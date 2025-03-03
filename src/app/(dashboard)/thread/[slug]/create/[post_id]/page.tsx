"use client";
import { revalidatePath } from "next/cache";

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
} from "@/components/ui/resizable";
import { updateThreadPost } from "@/features/thread/actions/supabase/update-thread-posts";
import { fetchThreadPostsByThreadId } from "@/features/thread/actions/supabase/fetch-thread-post-by-post-id";
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

  const [post, setPost] = useState(null); // post 데이터를 저장할 state
  const [loadingPost, setLoadingPost] = useState(true); // 로딩 상태 추가
  const [errorPost, setErrorPost] = useState(null);

  const [leftTopContent, setLeftTopContent] = useState("");
  const [selectedOption, setSelectedOption] = useState("수정하기");
  const [leftBottomContent, setLeftBottomContent] = useState(
    optionValues["초안 작성하기"]
  );
  const [rightContent, setRightContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { slug, post_id } = params;
  const router = useRouter();

  // ✅ useEffect를 사용하여 post 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await fetchThreadPostsByThreadId({ postId: post_id });
        setPost(data);
        setLeftTopContent(data["0"]["input"]);
        setRightContent(data["0"]["abstract"]);
      } catch (err) {
        console.error("❌ Error fetching post:", err);
        setErrorPost("게시글을 불러오는 중 오류 발생");
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [post_id]);

  // ✅ post 데이터 출력 확인
  console.log("post:", post);

  useEffect(() => {
    setLeftBottomContent(optionValues[selectedOption] || "");
  }, [selectedOption]);

  const handleOptionChange = (value) => {
    setSelectedOption(value);
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

  const handleSubmit = async () => {
    if (!leftTopContent.trim() && !leftBottomContent.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    const content = await getOpenAICompletion({
      prompt: post["0"]["abstract"] + "\n" + leftBottomContent,
    });

    try {
      const threadData = await fetchThreadBySlug(slug);
      const threadPostData = [
        {
          abstract: content,
          thread_id: threadData.id,
          created_at: new Date().toISOString(),
        },
      ];
      const db_result = await updateThreadPost({
        postId: post_id,
        threadPostData: threadPostData,
      });

      console.log("db_result:", db_result);

      if (!db_result) {
        throw new Error("Supabase 저장 실패");
      }
      setRightContent(content);
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
              {loading ? "작성 중..." : "수정하기"}
            </Button>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} className="p-4">
        {loadingPost ? (
          <p>게시글을 불러오는 중...</p>
        ) : errorPost ? (
          <p className="text-red-500">{errorPost}</p>
        ) : post ? (
          <div>
            <h2 className="text-xl font-bold">게시글 내용</h2>
            <p>{rightContent}</p>
          </div>
        ) : (
          <p>아직 작성된 초안이 없습니다.</p>
        )}
        <Button
          onClick={handleConfirm}
          className="w-full py-3 text-lg font-semibold"
        >
          스레드 포스트하기
        </Button>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
