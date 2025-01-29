"use client";
// hooks
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useThreadAuth } from "@/features/thread/hooks/use-thread-auth";
// components
import { Skeleton } from "@/components/ui/skeleton";

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const { code } = useParams(); // 항상 /thread/callback 경로에 존재하며 code를 받아옴
  const router = useRouter();
  const { updateAccessToken, isLoading, error, profile } = useThreadAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (!code) {
        console.warn("Code not found. Redirecting to /thread...");
        router.push("/thread");
        return;
      }

      try {
        console.log("Updating access token...");
        await updateAccessToken(code as string);

        if (profile?.username) {
          console.log("Access token updated successfully. Redirecting...");
          router.push(`/thread/${profile.username}`); // username 기반으로 리다이렉션
        } else {
          console.warn("Profile username not found. Redirecting to /thread...");
          router.push("/thread");
        }
      } catch (err) {
        console.error("Error updating access token:", err);
        router.push("/thread/error"); // 에러 발생 시 리다이렉트
      }
    };

    updateToken();
  }, [code, updateAccessToken, profile, router]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="h-8 w-48 rounded-lg mb-4" /> {/* 제목 */}
        <Skeleton className="h-6 w-64 rounded-lg mb-2" /> {/* 부제목 */}
        <Skeleton className="h-12 w-12 rounded-full" /> {/* 로딩 아이콘 */}
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return <>{children}</>;
}
