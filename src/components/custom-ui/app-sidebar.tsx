"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLoggedInUser } from "@/features/common/hooks/use-logged-in-user";

// import { fetchProjects } from "@/features/projects/actions/fetch-projects";
import {
  Rss,
  Frame,
  Users,
  LifeBuoy,
  Send,
  ScanSearch,
  TextCursor,
  ChartBarDecreasing,
  Settings,
} from "lucide-react";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";

const data = {
  projectSetting: [
    {
      title: "스레드 포스트",
      url: "",
      icon: ChartBarDecreasing,
    },
    {
      title: "설정",
      url: "/setting",
      icon: Settings,
    },
  ],
  navSecondary: [
    {
      title: "고객센터",
      url: "/customer-service",
      icon: LifeBuoy,
    },
    {
      title: "피드백",
      url: "/feedback",
      icon: Send,
    },
    {
      title: "블로그",
      url: "/blog",
      icon: Send,
    },
    {
      title: "가이드",
      url: "/guide",
      icon: Send,
    },
    {
      title: "홈페이지",
      url: "/",
      icon: Send,
    },
  ],
};

export type Project = {
  name: string;
  logo: React.ElementType;
  url: string;
  isActive: boolean;
  slug: string;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();

  const loggedInUserString = localStorage.getItem("loggedInUser");

  // console.log("loggedInUser", loggedInUser);
  if (!loggedInUserString) return null;

  const loggedInUser = JSON.parse(loggedInUserString);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>THREAD BOOSTER</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>스레드 관리</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="스레드 관리"
                  isActive={pathname.includes("/thread")}
                >
                  <button onClick={() => router.push(`/thread`)}>
                    <ChartBarDecreasing />
                    스레드 관리
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="AI 스레드 작성"
                  isActive={pathname.includes("/thread/writing")}
                >
                  <button onClick={() => router.push(`/thread/writing`)}>
                    <ChartBarDecreasing />
                    AI 스레드 작성
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser loggedInUser={loggedInUser} />
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
