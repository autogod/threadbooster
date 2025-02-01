"use client";

// hooks
import React, { useEffect, useState, useCallback } from "react";
// actions
import { getThreadAccessToken } from "@/features/thread/actions/get-thread-access-token";
import { fetchThreadByUserId } from "@/features/thread/actions/fetch-thread-by-user-id";
import { getThreadProfile } from "@/features/thread/actions/get-thread-profile";
import { updateThread } from "@/features/thread/actions/update-threads";
import { addThread } from "@/features/thread/actions/add-threads";
import { addThreadPost } from "@/features/thread/actions/add-thread-posts";
import { getThreadPosts } from "@/features/thread/actions/get-thread-posts";
import { exchangeForLongLivedToken } from "@/features/thread/actions/exchange-long-lived-token";
// types
import { ThreadsProfile } from "@/features/thread/actions/get-thread-profile";
import { ThreadPostInsert } from "@/features/thread/types/types";
import { ThreadPostData } from "@/features/thread/types/types";
import { AddThread } from "@/features/thread/queries/define-add-threads";
import { UpdateThread } from "@/features/thread/queries/define-update-threads";

type UseThreadAuthResult = {
  isLoading: boolean;
  error: string | null;
  setAccessToken: (code: string) => Promise<ThreadsProfile | undefined>;
  checkAccessTokenExpiry: (userId: string) => Promise<boolean>;
  // threadProfile: ThreadsProfile | null;
};

export function useThreadAuth(): UseThreadAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update Access Token
   * 만약에 Thread 데이터가 DB에 없다면 새로 생성하고, 있다면 업데이트한다.
   */
  const setAccessToken = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: 짧은-lived 토큰 받기
      const result = await getThreadAccessToken(code);
      if ("error_type" in result) {
        console.error("Error getting access token:", result.error_message);
        setError(result.error_message || "Failed to get access token");
        return;
      }
      const { access_token: shortLivedToken, user_id } = result;

      // Step 2: 서버 환경변수에서 Threads App 시크릿 가져오기
      const clientSecret = process.env.THREADS_APP_SECRET;
      if (!clientSecret) {
        throw new Error("Threads App secret is not configured");
      }

      // Step 3: 짧은-lived 토큰을 long-lived 토큰으로 교환
      const longLivedTokenResponse = await exchangeForLongLivedToken(
        shortLivedToken,
        clientSecret
      );
      const longLivedToken = longLivedTokenResponse.access_token;

      // Step 4: long-lived 토큰을 사용해 프로필 가져오기, DB 업데이트 등 필요한 작업 수행
      const threadProfile = await getThreadProfile(longLivedToken);
      // setThreadProfile(threadProfile);

      // 토큰과 만료시간을 localStorage 등에 저장
      localStorage.setItem("thread_access_token", longLivedToken);
      const tokenExpiry = new Date(
        Date.now() + longLivedTokenResponse.expires_in * 1000
      ).toISOString();
      localStorage.setItem("thread_access_token_expiry", tokenExpiry);

      // Step 4: Get profile ID from localStorage
      const storedProfile = localStorage.getItem("loggedInUser");
      const ownerProfileId = storedProfile
        ? JSON.parse(storedProfile).profile.id
        : null;

      if (!ownerProfileId) {
        throw new Error("Owner profile ID not found in local storage");
      }

      // Step 2: Check if thread data already exists in DB
      let thread = null;
      try {
        thread = await fetchThreadByUserId(user_id.toString());
      } catch (fetchError) {
        console.warn("Thread not found, creating a new one...");
      }

      // Step 5: Update or add thread in DB
      let updatedThread: UpdateThread | AddThread;
      if (thread) {
        updatedThread = await updateThread({
          threadId: thread.id,
          threadData: {
            thread_access_token: longLivedToken,
            thread_user_id: user_id.toString(),
            thread_access_token_expired_at: tokenExpiry,
            thread_metadata: threadProfile, // Storing profile in metadata
          },
        });
      } else {
        updatedThread = await addThread({
          threadData: {
            slug: threadProfile.username || `thread-${user_id}`,
            thread_access_token: longLivedToken,
            thread_user_id: user_id.toString(),
            thread_metadata: threadProfile,
            owner_profile_id: ownerProfileId, // Fetched from localStorage
          },
        });
      }

      console.log("Access token and thread data updated successfully.");
      await getInitialThreadPosts(updatedThread.id);
      return threadProfile;
    } catch (err) {
      console.error("Error during updateAccessToken:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialThreadPosts = async (threadId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get access token from localStorage
      const accessToken = localStorage.getItem("thread_access_token");

      if (!accessToken) {
        throw new Error("Access token not found in localStorage");
      }

      // Step 2: Fetch thread posts from Threads API
      const threadPosts = await getThreadPosts(accessToken);

      // Step 3: API 응답의 각 포스트를 DB 삽입용 객체(ThreadPostInsert)로 매핑
      const postsToInsert: ThreadPostInsert[] = threadPosts.map(
        (post: ThreadPostData) => {
          return {
            thread_id: threadId,
            content: post.text || null,
            raw_data: post,
          };
        }
      );

      // Step 4: 매핑한 포스트들을 DB에 삽입
      const insertedPosts = await addThreadPost({
        threadPostDatas: postsToInsert,
      });

      console.log("Thread posts fetched successfully.");
      return threadPosts;
    } catch (err) {
      console.error("Error fetching thread posts:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if the access token is expired
   */
  const checkAccessTokenExpiry = useCallback(
    async (userId: string): Promise<boolean> => {
      // Step 1: Check localStorage for expiry datetime
      const localExpiry = localStorage.getItem("thread_access_token_expiry");

      if (localExpiry) {
        const expiryDate = new Date(localExpiry);
        if (expiryDate > new Date()) {
          console.log("Access token is still valid (localStorage).");
          return false; // Token is valid
        }
      }

      // Step 2: Check database for token expiry
      try {
        const thread = await fetchThreadByUserId(userId);

        if (!thread || !thread.thread_access_token_expired_at) {
          console.warn("Thread or token expiry datetime not found in DB.");
          return true; // Expired if no token data is found
        }

        const dbExpiryDate = new Date(thread.thread_access_token_expired_at);
        if (dbExpiryDate > new Date()) {
          console.log("Access token is still valid (database).");

          // Sync valid DB expiry to localStorage
          localStorage.setItem(
            "thread_access_token_expiry",
            thread.thread_access_token_expired_at
          );

          return false; // Token is valid
        }
      } catch (error) {
        console.error("Error checking token expiry in DB:", error);
      }

      console.warn("Access token is expired.");
      return true; // Token is expired
    },
    []
  );

  return {
    isLoading,
    error,
    setAccessToken,
    checkAccessTokenExpiry,
  };
}
