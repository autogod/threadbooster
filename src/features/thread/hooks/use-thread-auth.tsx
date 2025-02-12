"use client";

// hooks
import React, { useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "@/features/common/atoms/state"; // Recoil atom import
// utils
import { devLog } from "@/utils/logUtils";
// actions
import { getThreadAccessToken } from "@/features/thread/actions/get-thread-access-token";
import { fetchThreadByUserId } from "@/features/thread/actions/fetch-thread-by-user-id";
import { getThreadProfile } from "@/features/thread/actions/get-thread-profile";
import { updateThread } from "@/features/thread/actions/update-threads";
import { addThread } from "@/features/thread/actions/add-threads";
import { exchangeForLongLivedToken } from "@/features/thread/actions/exchange-long-lived-token";
// types
import { ThreadsProfile } from "@/features/thread/actions/get-thread-profile";
import { AddThread } from "@/features/thread/queries/define-add-threads";
import { UpdateThread } from "@/features/thread/queries/define-update-threads";

type UseThreadAuthResult = {
  isLoading: boolean;
  error: string | null;
  setAccessToken: (code: string) => Promise<ThreadsProfile | undefined>;
  checkAccessTokenExpiry: (userId: string) => Promise<boolean>;
};

export function useThreadAuth(): UseThreadAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Recoil에서 로그인된 사용자 정보 가져오기
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const ownerProfileId = loggedInUser?.profile?.id;

  /**
   * Update Access Token
   */
  const setAccessToken = async (code: string) => {
    devLog("▶ [setAccessToken] Start - Code received:", code);
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get short-lived access token
      devLog("▶ [Step 1] Requesting short-lived access token...");
      const result = await getThreadAccessToken(code);
      devLog("✅ [Step 1] Access Token Response:", result);

      if ("error_type" in result) {
        console.error(
          "❌ [Step 1] Error getting access token:",
          result.error_message
        );
        setError(result.error_message || "Failed to get access token");
        return;
      }
      const { access_token: shortLivedToken, user_id } = result;

      // Step 2: Exchange short-lived token for long-lived token
      devLog("▶ [Step 2] Exchanging for long-lived token...");
      const longLivedTokenResponse = await exchangeForLongLivedToken(
        shortLivedToken
      );
      devLog("✅ [Step 2] Long-lived Token Response:", longLivedTokenResponse);
      const longLivedToken = longLivedTokenResponse.access_token;

      // Step 3: Fetch user profile using long-lived token
      devLog("▶ [Step 3] Fetching user profile...");
      const threadProfile = await getThreadProfile(longLivedToken);
      devLog("✅ [Step 3] Thread Profile Response:", threadProfile);

      // Step 4: Store token in localStorage
      devLog("▶ [Step 4] Storing token in localStorage...");
      localStorage.setItem("thread_access_token", longLivedToken);
      const tokenExpiry = new Date(
        Date.now() + longLivedTokenResponse.expires_in * 1000
      ).toISOString();
      localStorage.setItem("thread_access_token_expiry", tokenExpiry);
      devLog("✅ [Step 4] Token stored, Expiry:", tokenExpiry);

      // Step 5: Retrieve owner profile ID from Recoil
      devLog("▶ [Step 5] Retrieving owner profile ID from Recoil...");
      if (!ownerProfileId) {
        throw new Error(
          "❌ [Step 5] Owner profile ID not found in Recoil state."
        );
      }
      devLog("✅ [Step 5] Owner Profile ID:", ownerProfileId);

      // Step 6: Check if thread data exists in DB
      devLog("▶ [Step 6] Checking existing thread data...");
      let thread = null;
      try {
        thread = await fetchThreadByUserId(user_id.toString());
        devLog("✅ [Step 6] Thread found in DB:", thread);
      } catch (fetchError) {
        console.warn("⚠️ [Step 6] Thread not found, creating a new one...");
      }

      // Step 7: Update or add thread in DB
      devLog("▶ [Step 7] Updating or adding thread in DB...");
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
      devLog("✅ [Step 7] Thread Updated or Added:", updatedThread);

      console.log("✅ [setAccessToken] Completed successfully.");
      return threadProfile;
    } catch (err) {
      console.error("❌ [setAccessToken] Error:", err);
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
      devLog(
        "▶ [checkAccessTokenExpiry] Checking token expiry for user:",
        userId
      );

      // Step 1: Check localStorage
      const localExpiry = localStorage.getItem("thread_access_token_expiry");
      if (localExpiry) {
        const expiryDate = new Date(localExpiry);
        if (expiryDate > new Date()) {
          devLog(
            "✅ [checkAccessTokenExpiry] Token is still valid (localStorage)."
          );
          return false;
        }
      }

      // Step 2: Check database
      try {
        devLog("▶ [checkAccessTokenExpiry] Checking token in database...");
        const thread = await fetchThreadByUserId(userId);

        if (!thread || !thread.thread_access_token_expired_at) {
          console.warn("⚠️ [checkAccessTokenExpiry] Token not found in DB.");
          return true;
        }

        const dbExpiryDate = new Date(thread.thread_access_token_expired_at);
        if (dbExpiryDate > new Date()) {
          devLog("✅ [checkAccessTokenExpiry] Token is valid (DB).");
          localStorage.setItem(
            "thread_access_token_expiry",
            thread.thread_access_token_expired_at
          );
          return false;
        }
      } catch (error) {
        console.error("❌ [checkAccessTokenExpiry] Error checking DB:", error);
      }

      console.warn("⚠️ [checkAccessTokenExpiry] Token is expired.");
      return true;
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
