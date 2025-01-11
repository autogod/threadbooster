"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";

export function NavHeaderWithTrigger() {
  const pathname = usePathname();
  const header = "스레드 관리";

  return (
    <div className="w-full flex items-center gap-4 mb-2">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold">{header}</h1>
    </div>
  );
}
