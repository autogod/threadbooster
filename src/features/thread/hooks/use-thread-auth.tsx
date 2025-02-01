"use client";

// hooks
import React, { useEffect, useState, useCallback } from "react";
import { useRecoilState } from "recoil";
// actions
import { getThreadAccessToken } from "@/features/thread/actions/get-thread-access-token";
import { fetchThreadByUserId } from "@/features/thread/actions/fetch-thread-by-user-id";
import { getThreadProfile } from "@/features/thread/actions/get-thread-profile";
import { updateThread } from "@/features/thread/actions/update-threads";
import { addThread } from "@/features/thread/actions/add-threads";
// atoms
import { threadProfileAtom } from "@/features/thread/atoms/state";
// types
import { ThreadsProfile } from "@/features/thread/actions/get-thread-profile";

type UseThreadAuthResult = {
  isLoading: boolean;
  error: string | null;
  setAccessToken: (code: string) => Promise<void>;
  checkAccessTokenExpiry: (userId: string) => Promise<boolean>;
  threadProfile: ThreadsProfile | null;
};

export function useThreadAuth(): UseThreadAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [profile, setProfile] = useState<ThreadsProfile | null>(null);
  const [threadProfile, setThreadProfile] = useRecoilState(threadProfileAtom);

  /**
   * Update Access Token
   * 만약에 Thread 데이터가 DB에 없다면 새로 생성하고, 있다면 업데이트한다.
   */
  const setAccessToken = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get access token from Threads API by exchanging code
      const result = await getThreadAccessToken(code);

      // 에러 응답일 경우
      if ("error_type" in result) {
        console.error("Error getting access token:", result.error_message);
        setError(result.error_message || "Failed to get access token");
        return;
      }

      // 성공 응답일 경우
      const { access_token, user_id } = result;

      // Step 2: Check if thread data already exists in DB
      let thread = null;
      try {
        thread = await fetchThreadByUserId(user_id.toString());
      } catch (fetchError) {
        console.warn("Thread not found, creating a new one...");
      }

      // Step 3: Fetch profile data from Threads API
      const threadProfile = await getThreadProfile(access_token);
      setThreadProfile(threadProfile);

      // Calculate expiry datetime (assuming token expires in 1 hour)
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      // Step 4: Get profile ID from localStorage
      const storedProfile = localStorage.getItem("loggedInUser");
      const ownerProfileId = storedProfile
        ? JSON.parse(storedProfile).profile.id
        : null;

      if (!ownerProfileId) {
        throw new Error("Owner profile ID not found in local storage");
      }

      // Step 5: Update or add thread in DB
      if (thread) {
        await updateThread({
          threadId: thread.id,
          threadData: {
            thread_access_token: access_token,
            thread_user_id: user_id.toString(),
            thread_access_token_expired_at: tokenExpiry,
            thread_metadata: threadProfile, // Storing profile in metadata
          },
        });
      } else {
        await addThread({
          threadData: {
            slug: threadProfile.username || `thread-${user_id}`,
            thread_access_token: access_token,
            thread_user_id: user_id.toString(),
            thread_metadata: threadProfile,
            owner_profile_id: ownerProfileId, // Fetched from localStorage
          },
        });
      }

      // Step 6: Save access token and expiry time to localStorage
      localStorage.setItem("thread_access_token", access_token);
      localStorage.setItem("thread_access_token_expiry", tokenExpiry);

      console.log("Access token and thread data updated successfully.");
    } catch (err) {
      console.error("Error during updateAccessToken:", err);
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
    threadProfile,
  };
}
