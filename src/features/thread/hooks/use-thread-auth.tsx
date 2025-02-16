"use client";

import React, { useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "@/features/common/atoms/state";
import { devLog } from "@/utils/logUtils";
import { getThreadAccessToken } from "@/features/thread/actions/thread/get-thread-access-token";
import { getThreadProfile } from "@/features/thread/actions/thread/get-thread-profile";
import { fetchThreadByUserId } from "@/features/thread/actions/supabase/fetch-thread-by-user-id";
import { updateThread } from "@/features/thread/actions/supabase/update-threads";
import { addThread } from "@/features/thread/actions/supabase/add-threads";
import { exchangeForLongLivedToken } from "@/features/thread/actions/thread/exchange-long-lived-token";
import { syncAllPosts } from "@/features/thread/actions/sync-all-posts";
import type { ThreadsProfile } from "@/features/thread/actions/thread/get-thread-profile";
import type { AddThread } from "@/features/thread/queries/define-add-threads";
import type { UpdateThread } from "@/features/thread/queries/define-update-threads";

export type UseThreadAuthResult = {
  error: string | null;
  setAccessToken: (code: string) => Promise<
    | {
        threadProfile: ThreadsProfile;
        threadId: string;
        longLivedToken: string;
      }
    | undefined
  >;
  checkAccessTokenExpiry: (userId: string) => Promise<boolean>;
  currentStep: number;
  statusMessage: string;
  updateStatus: (step: number, message: string) => void;
};

export function useThreadAuth(): UseThreadAuthResult {
  // 내부 isLoading 제거
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const ownerProfileId = loggedInUser?.profile?.id;

  // 외부에서 상태(현재 단계, 상태 메시지)를 업데이트할 수 있도록 함수 제공
  const updateStatus = (step: number, message: string) => {
    setCurrentStep(step);
    setStatusMessage(message);
  };

  const setAccessToken = async (
    code: string
  ): Promise<
    | {
        threadProfile: ThreadsProfile;
        threadId: string;
        longLivedToken: string;
      }
    | undefined
  > => {
    devLog("▶ [setAccessToken] 시작 - 전달된 코드:", code);
    setError(null);

    try {
      // 1단계: 단기 액세스 토큰 요청 중...
      updateStatus(1, "단기 액세스 토큰 요청 중...");
      const result = await getThreadAccessToken(code);
      devLog("✅ [1단계] 액세스 토큰 응답:", result);

      if ("error_type" in result) {
        console.error("❌ [1단계] 오류:", result.error_message);
        setError(result.error_message || "액세스 토큰을 가져오지 못했습니다.");
        return;
      }
      const { access_token: shortLivedToken, user_id } = result;

      // 2단계: 장기 액세스 토큰으로 교환 중...
      updateStatus(2, "장기 액세스 토큰으로 교환 중...");
      const longLivedTokenResponse = await exchangeForLongLivedToken(
        shortLivedToken
      );
      devLog("✅ [2단계] 장기 액세스 토큰 응답:", longLivedTokenResponse);
      const longLivedToken = longLivedTokenResponse.access_token;

      // 3단계: 사용자 프로필 가져오는 중...
      updateStatus(3, "사용자 프로필 가져오는 중...");
      const threadProfile = await getThreadProfile(longLivedToken);
      devLog("✅ [3단계] 사용자 프로필 응답:", threadProfile);

      // 4단계: 토큰을 로컬에 저장 중...
      updateStatus(4, "토큰을 로컬에 저장 중...");
      localStorage.setItem("thread_access_token", longLivedToken);
      const tokenExpiry = new Date(
        Date.now() + longLivedTokenResponse.expires_in * 1000
      ).toISOString();
      localStorage.setItem("thread_access_token_expiry", tokenExpiry);
      devLog("✅ [4단계] 토큰 저장 완료, 만료 시간:", tokenExpiry);

      // 5단계: 소유자 프로필 ID 확인 중...
      updateStatus(5, "소유자 프로필 ID 확인 중...");
      if (!ownerProfileId) {
        throw new Error("Recoil 상태에서 소유자 프로필 ID를 찾을 수 없습니다.");
      }
      devLog("✅ [5단계] 소유자 프로필 ID:", ownerProfileId);

      // 6단계: 기존 스레드 데이터 확인 중...
      updateStatus(6, "기존 스레드 데이터 확인 중...");
      let thread = null;
      try {
        thread = await fetchThreadByUserId(user_id.toString());
        devLog("✅ [6단계] DB에서 스레드 데이터 발견:", thread);
      } catch (fetchError) {
        console.warn(
          "⚠️ [6단계] DB에서 스레드 데이터를 찾지 못함, 새로 생성합니다."
        );
      }

      // 7단계: 스레드 데이터 업데이트 중...
      updateStatus(7, "스레드 데이터 업데이트 중...");
      let updatedThread: UpdateThread | AddThread;
      if (thread) {
        updatedThread = await updateThread({
          threadId: thread.id,
          threadData: {
            thread_access_token: shortLivedToken,
            thread_long_lived_token: longLivedToken,
            thread_user_id: user_id.toString(),
            thread_access_token_expired_at: tokenExpiry,
            thread_metadata: threadProfile,
          },
        });
      } else {
        updatedThread = await addThread({
          threadData: {
            slug: threadProfile.username || `thread-${user_id}`,
            thread_access_token: shortLivedToken,
            thread_long_lived_token: longLivedToken,
            thread_user_id: user_id.toString(),
            thread_metadata: threadProfile,
            owner_profile_id: ownerProfileId,
          },
        });
      }
      updateStatus(7, "스레드 인증 완료.");
      console.log("✅ [setAccessToken] 완료.");
      return { threadProfile, threadId: updatedThread.id, longLivedToken };
    } catch (err) {
      console.error("❌ [setAccessToken] 오류:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  const checkAccessTokenExpiry = useCallback(
    async (userId: string): Promise<boolean> => {
      devLog(
        "▶ [checkAccessTokenExpiry] 사용자 토큰 만료 여부 확인 중:",
        userId
      );

      // localStorage에서 만료 시간 확인
      const localExpiry = localStorage.getItem("thread_access_token_expiry");
      if (localExpiry) {
        const expiryDate = new Date(localExpiry);
        if (expiryDate > new Date()) {
          devLog("✅ [checkAccessTokenExpiry] 토큰 유효 (localStorage).");
          return false;
        }
      }

      // DB에서 확인
      try {
        devLog("▶ [checkAccessTokenExpiry] DB에서 토큰 확인 중...");
        const thread = await fetchThreadByUserId(userId);

        if (!thread || !thread.thread_access_token_expired_at) {
          console.warn(
            "⚠️ [checkAccessTokenExpiry] DB에서 토큰 정보를 찾지 못함."
          );
          return true;
        }

        const dbExpiryDate = new Date(thread.thread_access_token_expired_at);
        if (dbExpiryDate > new Date()) {
          devLog("✅ [checkAccessTokenExpiry] 토큰 유효 (DB).");
          localStorage.setItem(
            "thread_access_token_expiry",
            thread.thread_access_token_expired_at
          );
          return false;
        }
      } catch (error) {
        console.error(
          "❌ [checkAccessTokenExpiry] DB 확인 중 오류 발생:",
          error
        );
      }

      console.warn("⚠️ [checkAccessTokenExpiry] 토큰 만료됨.");
      return true;
    },
    []
  );

  return {
    error,
    setAccessToken,
    checkAccessTokenExpiry,
    currentStep,
    statusMessage,
    updateStatus,
  };
}
