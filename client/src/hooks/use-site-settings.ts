import { useQuery } from "@tanstack/react-query";
import defaultLogo from "@assets/image_1771352006885.png";

interface SiteSettings {
  leagueName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappNumber: string | null;
}

export function useSiteSettings() {
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000,
  });

  return {
    settings,
    isLoading,
    logoUrl: settings?.logoUrl?.trim() ? settings.logoUrl : defaultLogo,
    leagueName: settings?.leagueName?.trim() ? settings.leagueName : "La Liga de Campeones",
  };
}
