// /thread

import { SyncButton } from "@/features/thread/components/sync-button";

// - 스레드 계정 리스트업
export default function Page() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-between">
      <SyncButton />
    </main>
  );
}
