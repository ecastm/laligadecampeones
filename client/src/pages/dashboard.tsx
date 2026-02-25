import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import AdminDashboard from "./admin/dashboard";
import CaptainDashboard from "./captain/dashboard";
import RefereeDashboard from "./referee/dashboard";
import MarketingDashboard from "./marketing/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "CAPITAN":
      return <CaptainDashboard />;
    case "ARBITRO":
      return <RefereeDashboard />;
    case "MARKETING":
      return <MarketingDashboard />;
    default:
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Rol no reconocido</p>
        </div>
      );
  }
}
