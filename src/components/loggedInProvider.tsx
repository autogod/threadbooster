"use client";

import React, { ReactNode, useEffect } from "react";
import { useSetRecoilState } from "recoil";
// atoms
import { loggedInUserAtom } from "@/features/common/atoms/state";
// types
import { LoggedInUser } from "@/features/common/types/types";

interface ProvidersProps {
  children: ReactNode;
  loggedInUser?: LoggedInUser; // 선택적으로 받음
}

/**
 * LoggedInProviders component
 * - Stores `loggedInUser` in Recoil state
 */
export function LoggedInProviders({ children, loggedInUser }: ProvidersProps) {
  const setLoggedInUser = useSetRecoilState(loggedInUserAtom);
  // Save `loggedInUser` to localStorage when provided
  useEffect(() => {
    console.log("loggedInUser", loggedInUser);
    if (loggedInUser) {
      // localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      setLoggedInUser(loggedInUser);
    }
  }, [loggedInUser, setLoggedInUser]);

  return <>{children}</>;
}
