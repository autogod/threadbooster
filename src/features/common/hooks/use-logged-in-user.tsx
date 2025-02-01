"use client";

import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "@/features/common/atoms/state";
import { LoggedInUser } from "@/features/common/types/types";

/**
 * Custom hook to get the profileId from Recoil state
 */
export function useLoggedInUser(): LoggedInUser | null {
  const loggedInUser = useRecoilValue(loggedInUserAtom);

  // useEffect(() => {
  //   console.log("loggedInUser:", loggedInUser);
  // }, [loggedInUser]);

  return loggedInUser;
}
