import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Shield, Calendar, UserCog, LayoutDashboard, LogOut, Newspaper, ClipboardList, Layers, DollarSign, BarChart3, Settings, ScrollText, Megaphone, Image, MessageSquare } from "lucide-react";
import ligaLogo from "@assets/image_1771352006885.png";
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
import MarketingManagement from "./marketing";
import MessagesManagement from "./messages";
import Regulations from "@/components/regulations";

type AdminSection = "dashboard" | "users" | "teams" | "players" | "matches" | "tournament" | "news" | "referees" | "divisions" | "finances" | "statistics" | "regulations" | "marketing" | "messages";

const menuItems = [
  { id: "dashboard" as const, title: "Panel", icon: LayoutDashboard },
  { id: "teams" as const, title: "Equipos", icon: Shield },
  { id: "players" as const, title: "Jugadores", icon: Users },
  { id: "referees" as const, title: "Árbitros", icon: ClipboardList },
  { id: "matches" as const, title: "Partidos", icon: Calendar },
  { id: "tournament" as const, title: "Torneo", icon: Trophy },
  { id: "statistics" as const, title: "Estadísticas", icon: BarChart3 },
  { id: "finances" as const, title: "Finanzas", icon: DollarSign },
  { id: "news" as const, title: "Noticias", icon: Newspaper },
  { id: "marketing" as const, title: "Marketing", icon: Megaphone },
  { id: "messages" as const, title: "Mensajería", icon: MessageSquare },
  { id: "regulations" as const, title: "Reglamento", icon: ScrollText },
];

const configItems = [
  { id: "users" as const, title: "Usuarios", icon: UserCog },
  { id: "divisions" as const, title: "Divisiones", icon: Layers },
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
              <img src={ligaLogo} alt="La Liga de Campeones" className="h-10 w-10 object-contain" />
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
            <SidebarGroup>
              <SidebarGroupLabel>
                <Settings className="h-3.5 w-3.5 mr-1 inline" />
                Configuración
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {configItems.map((item) => (
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
                {[...menuItems, ...configItems].find(i => i.id === activeSection)?.title || "Panel"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-3 sm:p-6">
            {activeSection === "dashboard" && <AdminOverview onNavigate={setActiveSection} />}
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
            {activeSection === "marketing" && <MarketingManagement />}
            {activeSection === "messages" && <MessagesManagement />}
            {activeSection === "regulations" && <Regulations />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminOverview({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const overviewCards: { title: string; icon: typeof Trophy; description: string; section: AdminSection }[] = [
    { title: "Usuarios", icon: UserCog, description: "Gestiona administradores, capitanes y árbitros", section: "users" },
    { title: "Árbitros", icon: ClipboardList, description: "Catálogo completo de árbitros registrados", section: "referees" },
    { title: "Equipos", icon: Shield, description: "Administra los equipos del torneo", section: "teams" },
    { title: "Jugadores", icon: Users, description: "Gestiona los jugadores de cada equipo", section: "players" },
    { title: "Partidos", icon: Calendar, description: "Programa y administra los partidos", section: "matches" },
    { title: "Noticias", icon: Newspaper, description: "Publica reseñas y noticias del torneo", section: "news" },
    { title: "Marketing", icon: Megaphone, description: "Sube fotos y videos promocionales", section: "marketing" },
    { title: "Mensajería", icon: MessageSquare, description: "Mensajes de contacto recibidos", section: "messages" },
    { title: "Finanzas", icon: DollarSign, description: "Gestiona pagos, multas y gastos", section: "finances" },
    { title: "Estadísticas", icon: BarChart3, description: "Consulta goleadores y estadísticas", section: "statistics" },
    { title: "Torneo", icon: Trophy, description: "Configura y gestiona los torneos", section: "tournament" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bienvenido al Panel de Administración</h2>
        <p className="text-muted-foreground">
          Gestiona todos los aspectos del torneo desde este panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <div
            key={card.title}
            className="rounded-md border bg-card p-6 hover-elevate cursor-pointer"
            onClick={() => onNavigate(card.section)}
            data-testid={`card-${card.section}`}
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
