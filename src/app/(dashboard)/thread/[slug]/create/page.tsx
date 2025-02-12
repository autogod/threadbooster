"use client";

import { useState } from "react";
import { Textarea } from "../../../../../components/ui/textarea";
import { addThreadPost } from "@/features/thread/actions/supabase/add-thread-posts";
import { createThreadPost } from "@/features/thread/actions/thread/create-thread-post";
import { useRouter } from "next/navigation"; // ✅ Next.js의 useRouter 사용

export default function Page({ params }) {
  console.log("Params:", params);

  const [content, setContent] = useState(""); // ✅ 사용자가 입력할 스레드 내용
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
  const [error, setError] = useState(null); // ✅ 에러 상태 추가
  const { slug } = params;
  const router = useRouter(); // ✅ 리다이렉트를 위한 useRouter 추가

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken =
        "THAAQFWBJ1Y0BBYlc3czJYalljQjEwTk5EeFZAUOEwxQmFJc3ZA3bEU2b2tYWkR2bDczX0ZAnNlFIczFjQzY5QWtqRnJta0trbjlhcUdKS21VVThGb3FRc19ISThKZAE1ZAT2tOLW12T3QwSDV5Nm85NUVqRl9WR18xVWZAnQnFMQlZAvRGp1UjhJX2wzTVZAocVZA5OEUZD";

      // ✅ Supabase에 저장할 데이터 생성
      const threadPostData = [
        {
          content: content,
          thread_id: slug, // Thread ID 설정 (slug 사용)
          created_at: new Date().toISOString(), // 생성 시간 추가
        },
      ];

      // ✅ Supabase에 저장
      const db_success = await addThreadPost({
        threadPostDatas: threadPostData,
      });

      // ✅ API 요청을 통해 스레드 생성
      const api_success = await createThreadPost(accessToken, content);

      if (db_success && api_success) {
        setContent(""); // 입력창 초기화
        router.push(`/thread/${slug}`); // 작성 완료 후 이동
      }
    } catch (err) {
      console.error("Error creating thread:", err);
      setError("스레드 작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">스레드 게시글 작성페이지</h1>

      <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow">
        {/* ✅ Textarea 추가 */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="스레드를 작성하세요..."
          className="w-full h-40 p-2 border border-gray-300 rounded-md resize-none text-gray-900"
        />

        {/* ✅ 제출 버튼 추가 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-md text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "작성 중..." : "작성하기"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </main>
  );
}
