import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Shield, Calendar, UserCog, LayoutDashboard, LogOut, Newspaper, ClipboardList, Layers, DollarSign, BarChart3 } from "lucide-react";
import UsersManagement from "./users";
import TeamsManagement from "./teams";
import PlayersManagement from "./players";
import MatchesManagement from "./matches";
import TournamentManagement from "./tournament";
import NewsManagement from "./news";
import RefereesManagement from "./referees";
import DivisionsManagement from "./divisions";
import FinancesManagement from "./finances";
import StatisticsManagement from "./statistics";

type AdminSection = "dashboard" | "users" | "teams" | "players" | "matches" | "tournament" | "news" | "referees" | "divisions" | "finances" | "statistics";

const menuItems = [
  { id: "dashboard" as const, title: "Panel", icon: LayoutDashboard },
  { id: "users" as const, title: "Usuarios", icon: UserCog },
  { id: "referees" as const, title: "Árbitros", icon: ClipboardList },
  { id: "divisions" as const, title: "Divisiones", icon: Layers },
  { id: "teams" as const, title: "Equipos", icon: Shield },
  { id: "players" as const, title: "Jugadores", icon: Users },
  { id: "matches" as const, title: "Partidos", icon: Calendar },
  { id: "tournament" as const, title: "Torneo", icon: Trophy },
  { id: "statistics" as const, title: "Estadísticas", icon: BarChart3 },
  { id: "finances" as const, title: "Finanzas", icon: DollarSign },
  { id: "news" as const, title: "Noticias", icon: Newspaper },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

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
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">Panel Admin</p>
                <p className="text-xs text-muted-foreground truncate">{user?.name}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Gestión</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">
                {menuItems.find(i => i.id === activeSection)?.title || "Panel"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === "dashboard" && <AdminOverview />}
            {activeSection === "users" && <UsersManagement />}
            {activeSection === "referees" && <RefereesManagement />}
            {activeSection === "divisions" && <DivisionsManagement />}
            {activeSection === "teams" && <TeamsManagement />}
            {activeSection === "players" && <PlayersManagement />}
            {activeSection === "matches" && <MatchesManagement />}
            {activeSection === "tournament" && <TournamentManagement />}
            {activeSection === "statistics" && <StatisticsManagement />}
            {activeSection === "finances" && <FinancesManagement />}
            {activeSection === "news" && <NewsManagement />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bienvenido al Panel de Administración</h2>
        <p className="text-muted-foreground">
          Gestiona todos los aspectos del torneo desde este panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Usuarios", icon: UserCog, description: "Gestiona administradores, capitanes y árbitros" },
          { title: "Árbitros", icon: ClipboardList, description: "Catálogo completo de árbitros registrados" },
          { title: "Equipos", icon: Shield, description: "Administra los equipos del torneo" },
          { title: "Jugadores", icon: Users, description: "Gestiona los jugadores de cada equipo" },
          { title: "Partidos", icon: Calendar, description: "Programa y administra los partidos" },
          { title: "Noticias", icon: Newspaper, description: "Publica reseñas y noticias del torneo" },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-md border bg-card p-6 hover-elevate"
          >
            <card.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-semibold">{card.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
