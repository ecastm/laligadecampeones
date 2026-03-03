import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Megaphone, Newspaper, Image, LogOut, LayoutDashboard } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import NewsManagement from "../admin/news";
import MarketingManagement from "../admin/marketing";

type MarketingSection = "dashboard" | "marketing" | "news";

const menuItems = [
  { id: "dashboard" as const, title: "Panel", icon: LayoutDashboard },
  { id: "marketing" as const, title: "Marketing", icon: Image },
  { id: "news" as const, title: "Noticias", icon: Newspaper },
];

export default function MarketingDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<MarketingSection>("dashboard");
  const { logoUrl } = useSiteSettings();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-primary/30">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="La Liga de Campeones" className="h-16 w-16 object-contain drop-shadow-[0_2px_8px_rgba(198,160,82,0.3)]" />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate text-primary">Marketing</p>
                <p className="text-xs text-[#C0C0C0] truncate">{user?.name}</p>
              </div>
            </div>
            <div className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-primary to-emerald-400" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[#C0C0C0] uppercase tracking-wider text-[10px] font-semibold">Contenido</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="gap-3"
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className={`h-4 w-4 ${activeSection === item.id ? "text-emerald-400" : ""}`} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-3 border-t border-primary/20 space-y-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#C0C0C0] hover:text-white"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="relative p-4 border-b border-primary/20 flex items-center gap-3">
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400/50 via-primary/50 to-emerald-400/50" />
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">
              {menuItems.find((i) => i.id === activeSection)?.title || "Panel"}
            </h1>
          </div>
          <div className="p-4 md:p-6">
            {activeSection === "dashboard" && <MarketingHome onNavigate={setActiveSection} />}
            {activeSection === "marketing" && <MarketingManagement />}
            {activeSection === "news" && <NewsManagement />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function MarketingHome({ onNavigate }: { onNavigate: (s: MarketingSection) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Panel de Marketing</h2>
        <p className="text-[#C0C0C0] mt-1">Gestiona el contenido multimedia y las noticias de La Liga de Campeones.</p>
        <div className="mt-3 h-[2px] w-24 rounded-full bg-gradient-to-r from-emerald-400 to-primary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("marketing")}
          className="group rounded-lg border border-[#C0C0C0]/20 p-6 text-left transition-all hover:shadow-md hover:border-primary/50 space-y-2"
          data-testid="card-marketing"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-400/10 flex items-center justify-center transition-colors group-hover:bg-emerald-400/20">
            <Image className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold">Fotos y Contenido</p>
          <p className="text-sm text-[#C0C0C0]">Sube fotos, crea contenido para redes sociales y gestiona la galería multimedia.</p>
        </button>
        <button
          onClick={() => onNavigate("news")}
          className="group rounded-lg border border-[#C0C0C0]/20 p-6 text-left transition-all hover:shadow-md hover:border-primary/50 space-y-2"
          data-testid="card-news"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-400/10 flex items-center justify-center transition-colors group-hover:bg-emerald-400/20">
            <Newspaper className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold">Noticias</p>
          <p className="text-sm text-[#C0C0C0]">Publica reseñas de partidos, novedades y comunicados de la liga.</p>
        </button>
      </div>
    </div>
  );
}
