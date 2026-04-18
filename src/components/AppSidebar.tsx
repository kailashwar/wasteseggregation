import { LayoutDashboard, MapPin, Camera, ClipboardList, BarChart3, Recycle, LogOut, User, QrCode } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Map View", url: "/map", icon: MapPin },
  { title: "Reports", url: "/reports", icon: ClipboardList },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const userItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Report Garbage", url: "/report", icon: Camera },
  { title: "Map View", url: "/map", icon: MapPin },
  { title: "My Reports", url: "/reports", icon: ClipboardList },
  { title: "My Credits", url: "/credits", icon: QrCode },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, role, username } = useAuth();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const items = role === "admin" ? adminItems : userItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <Recycle className="h-5 w-5 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <span className="font-heading text-lg font-bold text-sidebar-foreground">
              Plastic Spotter
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === "admin" ? "Admin" : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{username ?? "User"} ({role ?? "user"})</span>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
