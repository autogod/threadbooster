import { atom } from "recoil";

import { ThreadsProfile } from "@/features/thread/actions/thread/get-thread-profile";

export const threadProfileAtom = atom<ThreadsProfile | null>({
  key: "threadProfileAtom",
  default: null,
});
