
import { ReactNode } from "react";
import { SidebarMenu } from "./sidebar-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarMenu />
      <div className="flex-1 overflow-auto">
        <main className="w-full p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
