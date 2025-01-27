import "../globals.css";
// components
import localFont from "next/font/local";
import type { Metadata } from "next";
import { Providers } from "@/components/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom-ui/app-sidebar";
import { NavHeaderWithTrigger } from "@/components/custom-ui/nav-header-with-trigger";
// utils
import { redirect } from "next/navigation";
// actions
import { getProfileData } from "@/features/common/actions/get-profile";
// types
import { LoggedInUser } from "@/features/common/types/types";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "스레드부스터",
  description: "스레드부스터",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedInUser: LoggedInUser | null = await getProfileData();

  if (!loggedInUser) {
    redirect("/login");
  }

  return (
    <html lang="ko">
      <Providers loggedInUser={loggedInUser}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider className="h-full">
              <AppSidebar />
              <main className="flex flex-col h-full w-full bg-background ">
                <header className="sticky top-0 z-50 p-4 pb-0">
                  <NavHeaderWithTrigger />
                </header>
                <section
                  className="overflow-auto flex flex-1 p-4"
                  // style={{ backgroundColor: "red" }}
                >
                  {children}
                  <Toaster />
                </section>
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </Providers>
    </html>
  );
}
