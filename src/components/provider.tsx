"use client";

import React, { ReactNode, useEffect } from "react";
import { RecoilRoot } from "recoil";
// types
import { LoggedInUser } from "@/features/common/types/types";
import { LoggedInProviders } from "./loggedInProvider";

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
  return (
    <RecoilRoot>
      <LoggedInProviders loggedInUser={loggedInUser}>
        {children}
      </LoggedInProviders>
    </RecoilRoot>
  );
}
