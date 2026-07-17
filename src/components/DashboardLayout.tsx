import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HelpChat } from "@/components/HelpChat";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-heading font-semibold">Waste Segregation</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
        <HelpChat />
      </div>
    </SidebarProvider>
  );
}
