"use client";

// hooks
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // useSearchParams 사용
import { useThreadAuth } from "@/features/thread/hooks/use-thread-auth";
// components
import { Skeleton } from "@/components/ui/skeleton";

export function ThreadProvider() {
  const searchParams = useSearchParams(); // 쿼리스트링 가져오기
  const code = searchParams.get("code"); // ?code= 값 가져오기
  const router = useRouter();
  const { setAccessToken, isLoading, error, threadProfile } = useThreadAuth();

  console.log("Code from URL:", code); // 이제 undefined가 아니라 값이 나와야 함

  useEffect(() => {
    const updateToken = async () => {
      if (!code) {
        console.warn("Code not found. Redirecting to /thread...");
        router.push("/thread");
        return;
      }

      try {
        console.log("setting access token...");
        await setAccessToken(code);

        if (threadProfile?.username) {
          console.log("Access token updated successfully. Redirecting...");
          router.push(`/thread/${threadProfile.username}`); // username 기반으로 리다이렉션
        } else {
          console.warn("Profile username not found. Redirecting to /thread...");
          // router.push("/thread");
        }
      } catch (err) {
        console.error("Error updating access token:", err);
        // router.push("/thread/error");
      }
    };

    updateToken();
  }, [code, setAccessToken, threadProfile, router]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="h-8 w-48 rounded-lg mb-4" /> {/* 제목 */}
        <Skeleton className="h-6 w-64 rounded-lg mb-2" /> {/* 부제목 */}
        <Skeleton className="h-12 w-12 rounded-full" /> {/* 로딩 아이콘 */}
      </div>
    );
  if (error) return <div>Error: {error}</div>;
}
