"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useThreadAuth } from "@/features/thread/hooks/use-thread-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function ThreadProvider() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const router = useRouter();
  const { setAccessToken, isLoading, error } = useThreadAuth();

  console.log("Code from URL:", code);

  const updateToken = useCallback(
    async (code: string) => {
      try {
        console.log("setting access token...");
        const threadProfile = await setAccessToken(code);

        // Check if threadProfile is updated.
        if (threadProfile?.username) {
          console.log("Access token updated successfully. Redirecting...");
          router.push(`/thread/${threadProfile.username}`);
        } else {
          console.warn("Profile username not found. Redirecting to /thread...");
          router.push("/thread");
        }
      } catch (err) {
        console.error("Error updating access token:", err);
        router.push("/thread/error"); // Redirect on error if desired.
      }
    },
    [router, setAccessToken]
  );

  useEffect(() => {
    if (!code) {
      console.warn("Code not found. Redirecting to /thread...");
      router.push("/thread");
      return;
    }
    updateToken(code);
  }, [code, router, updateToken]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="h-8 w-48 rounded-lg mb-4" />
        <Skeleton className="h-6 w-64 rounded-lg mb-2" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );

  // Render the error message correctly by extracting a string.
  if (error) {
    const errorMessage =
      typeof error === "string"
        ? error
        : (error as { message: string })?.message || "Unknown error";

    return <div>Error: {errorMessage}</div>;
  }

  // Optionally, you might return null or a placeholder if everything is done.
  return null;
}
