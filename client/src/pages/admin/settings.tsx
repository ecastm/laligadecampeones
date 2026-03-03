import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSiteSettingsSchema, type SiteSettings, type InsertSiteSettings } from "@shared/schema";
import { Settings, Save, Globe, Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function SiteSettingsManagement() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const form = useForm<InsertSiteSettings>({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      leagueName: "",
      logoUrl: "",
      phone: "",
      email: "",
      address: "",
      instagramUrl: "",
      facebookUrl: "",
      whatsappNumber: "",
    },
    values: settings ? {
      leagueName: settings.leagueName || "",
      logoUrl: settings.logoUrl || "",
      phone: settings.phone || "",
      email: settings.email || "",
      address: settings.address || "",
      instagramUrl: settings.instagramUrl || "",
      facebookUrl: settings.facebookUrl || "",
      whatsappNumber: settings.whatsappNumber || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertSiteSettings) => {
      const res = await apiRequest("PUT", "/api/admin/site-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({ title: "Configuración guardada correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertSiteSettings) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2" data-testid="text-settings-title">
          <Settings className="h-6 w-6 text-primary" />
          Configuración del Sitio
        </h2>
        <p className="text-muted-foreground mt-1">
          Personaliza el nombre, logo y datos de contacto de tu liga
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Identidad de la Liga
              </CardTitle>
              <CardDescription>
                Logo y nombre que aparecen en toda la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel>Logo de la Liga</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                          label="Subir logo"
                          shape="circle"
                          size="lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex-1 w-full space-y-4">
                  <FormField
                    control={form.control}
                    name="leagueName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Liga</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: La Liga de Campeones"
                            data-testid="input-league-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                Datos de Contacto
              </CardTitle>
              <CardDescription>
                Información que aparece en la página principal y el formulario de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: +34 600 123 456"
                          data-testid="input-phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: info@laliga.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Dirección
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: C/ James Joyce 47, Teatinos, 29010 Málaga"
                        rows={2}
                        data-testid="input-address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Instagram className="h-5 w-5 text-primary" />
                Redes Sociales
              </CardTitle>
              <CardDescription>
                Enlaces a tus perfiles en redes sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Instagram className="h-3.5 w-3.5" />
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: https://instagram.com/tuliga"
                        data-testid="input-instagram"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Facebook className="h-3.5 w-3.5" />
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: https://facebook.com/tuliga"
                        data-testid="input-facebook"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: +34 600 123 456"
                        data-testid="input-whatsapp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto gap-2"
            disabled={updateMutation.isPending}
            data-testid="button-save-settings"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
