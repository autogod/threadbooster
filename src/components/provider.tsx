"use client";

import React, { ReactNode, useEffect } from "react";
import { RecoilRoot } from "recoil";
// types
import { LoggedInUser } from "@/features/common/types/types";

interface ProvidersProps {
  children: ReactNode;
  loggedInUser?: LoggedInUser; // 선택적으로 받음
}

/**
 * Providers component
 * - Stores `loggedInUser` in localStorage
 * - Does not manage React state
 */
export function Providers({ children, loggedInUser }: ProvidersProps) {
  // Save `loggedInUser` to localStorage when provided
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    }
  }, [loggedInUser]);

  return <RecoilRoot>{children}</RecoilRoot>;
}
