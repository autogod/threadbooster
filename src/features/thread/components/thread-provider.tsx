"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useThreadAuth } from "@/features/thread/hooks/use-thread-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { syncAllPosts } from "@/features/thread/actions/sync-all-posts"; // 스레드 포스트 동기화 함수 import

export function ThreadProvider() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setAccessToken, error, currentStep, statusMessage, updateStatus } =
    useThreadAuth();

  // 전체 단계 수: 기존 7단계 + 스레드 포스트 동기화 1단계 = 8단계
  const TOTAL_STEPS = 8;

  const updateToken = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);
        // 액세스 토큰 설정 및 DB 업데이트까지 처리
        const result = await setAccessToken(code);
        if (result) {
          // 추가: 8단계 - 스레드 포스트 동기화 진행
          updateStatus(8, "스레드 포스트 동기화 중...");
          await syncAllPosts(result.threadId, result.longLivedToken);
          updateStatus(8, "스레드 포스트 동기화 완료.");

          if (result.threadProfile?.username) {
            console.log("전체 과정 완료. 리다이렉트 중...");
            router.push(`/thread/${result.threadProfile.username}`);
          } else {
            console.warn(
              "프로필 사용자명이 없습니다. /thread로 리다이렉트합니다."
            );
            router.push("/thread");
          }
        } else {
          router.push("/thread/error");
        }
      } catch (err) {
        console.error("액세스 토큰 업데이트 오류:", err);
        router.push("/thread/error");
      } finally {
        setIsLoading(false);
      }
    },
    [router, setAccessToken, updateStatus]
  );

  useEffect(() => {
    if (!code) {
      console.warn("코드를 찾을 수 없습니다. /thread로 리다이렉트합니다.");
      router.push("/thread");
      return;
    }
    updateToken(code);
  }, [code, router]);

  // 진행 중이면 다이얼로그와 진행률 표시 (전체 과정이 끝날 때까지 다이얼로그 유지)
  if (isLoading) {
    const progressValue = (currentStep / TOTAL_STEPS) * 100;
    return (
      <Dialog open>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>스레드 인증 진행 중</DialogTitle>
            <DialogDescription>{statusMessage}</DialogDescription>
          </DialogHeader>
          <Progress value={progressValue} className="w-full" />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    const errorMessage =
      typeof error === "string"
        ? error
        : (error as { message: string })?.message || "알 수 없는 오류";
    return <div>오류: {errorMessage}</div>;
  }

  return null;
}
