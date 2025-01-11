"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRecoilState } from "recoil";
import { currentProjectAtom } from "@/features/common/atoms/state";
import type { Project } from "./app-sidebar";
import { ChevronsUpDown, Plus, Frame } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
// import { ProjectAddDialog } from "@/features/projects/components/project-add-dialog";

interface ProjectSwitcherProps {
  projects: Project[];
  profileId: string;
}

export function ProjectSwitcher({ projects, profileId }: ProjectSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectAtom);

  // const [activeProject, setActiveProject] = useState<Project>({
  //   name: "프로젝트를 선택하세요",
  //   logo: Frame,
  //   url: "#",
  //   slug: "",
  //   isActive: false,
  // });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleProjectSelect = (project: Project) => {
    // setActiveProject(project);
    setCurrentProject(project);
    router.push(project.url); // Navigate to the selected project's URL
  };

  // 1) 프로젝트 목록이 로드되었고, currentProject가 아직 null이면 첫번째 프로젝트로 설정(옵션)
  useEffect(() => {
    if (projects.length === 0) return;
    if (!currentProject) {
      // 첫 번째 프로젝트 자동 선택 (원하지 않으면 이 로직 제거)
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject, setCurrentProject]);

  // 표시할 프로젝트 명/로고
  const activeName = currentProject?.name || "프로젝트를 선택하세요";
  const ActiveLogo = currentProject?.logo || Frame;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ActiveLogo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{activeName}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                프로젝트
              </DropdownMenuLabel>
              {projects.length !== 0
                ? projects.map((project) => (
                    <DropdownMenuItem
                      key={project.slug}
                      onClick={() => handleProjectSelect(project)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <project.logo className="size-4 shrink-0" />
                      </div>
                      {project.name}
                    </DropdownMenuItem>
                  ))
                : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <DialogTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Plus className="mr-2 size-4" />새 프로젝트 추가
                  </div>
                </DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <ProjectAddDialog
            profileId={profileId}
            onClose={() => setDialogOpen(false)}
            revalidateTargetPath={pathname}
          /> */}
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
