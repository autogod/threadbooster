"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";
import { currentProjectAtom } from "@/features/common/atoms/state";
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
import { ProjectSwitcher } from "./project-switcher";
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

  // Recoil에서 현재 선택된 프로젝트
  const currentProject = useRecoilValue(currentProjectAtom);

  const [projects, setProjects] = useState<Project[]>([]);
  const loggedInUser = useLoggedInUser();

  useEffect(() => {
    const _fetchProjects = async () => {
      if (!loggedInUser) return;
      // const _projects = await fetchProjects(loggedInUser.profile.id);
      const _projects = [
        {
          name: "프로젝트1",
          logo: Frame,
          url: "/project1",
          slug: "project1",
        },
        {
          name: "프로젝트2",
          logo: Users,
          url: "/project2",
          slug: "project2",
        },
      ];
      setProjects(
        _projects.map((project) => {
          const basePath = pathname.split("/").slice(1).join("/");

          const newPath = `/${project.slug}/${basePath
            .split("/")
            .slice(1)
            .join("/")}`;

          return {
            name: project.name,
            logo: Frame,
            url: newPath,
            slug: project.slug,
            isActive: pathname.includes(project.slug),
          };
        })
      );
    };
    _fetchProjects();
  }, [loggedInUser, pathname]);

  // Determine the current project
  // const currentProject =
  //   pathname === "/blogs" || pathname === "/keyword"
  //     ? projects[0]
  //     : projects.find((project) => pathname.includes(`/${project.slug}`)) ||
  //       projects[0];
  console.log("loggedInUser", loggedInUser);
  if (!loggedInUser) return null;
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher
          projects={projects}
          profileId={loggedInUser.profile.id}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>스레드 관리</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.projectSetting.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname.includes(item.url)}
                  >
                    <button
                      onClick={() => {
                        if (currentProject) {
                          router.push(`/${currentProject.slug}${item.url}`);
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      {item.title}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
