import { useState, useEffect, useCallback } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getDismissKey(email: string): string {
  return `pwa_dismiss_count_${email}`;
}

const MAX_DISMISSALS = 4;

export default function PWAInstallBanner({ userEmail }: { userEmail: string }) {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandalone()) return;

    const key = getDismissKey(userEmail);
    const count = parseInt(localStorage.getItem(key) || "0", 10);
    if (count >= MAX_DISMISSALS) return;

    setVisible(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [userEmail]);

  const handleDismiss = useCallback(() => {
    const key = getDismissKey(userEmail);
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, String(current + 1));
    setVisible(false);
  }, [userEmail]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        const key = getDismissKey(userEmail);
        localStorage.setItem(key, String(MAX_DISMISSALS));
      }
      setDeferredPrompt(null);
      setVisible(false);
    } else {
      setShowIOSInstructions(true);
    }
  }, [deferredPrompt, userEmail]);

  if (!visible) return null;

  const key = getDismissKey(userEmail);
  const dismissCount = parseInt(localStorage.getItem(key) || "0", 10);
  const remaining = MAX_DISMISSALS - dismissCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden" data-testid="pwa-install-banner">
      <div className="bg-[#1a1a1a] border border-[#C6A052]/40 rounded-xl p-4 shadow-lg shadow-black/50">
        {showIOSInstructions ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[#C6A052] font-semibold text-sm">{isIOS() ? "Instalar en tu iPhone" : "Instalar en tu dispositivo"}</h3>
              <button onClick={handleDismiss} className="text-[#C0C0C0] hover:text-white" data-testid="button-dismiss-pwa">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[#C0C0C0] text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#C6A052] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Pulsa el icono de <Share className="inline h-3.5 w-3.5 text-[#C6A052]" /> <strong className="text-white">Compartir</strong> en la barra del navegador</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#C6A052] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Selecciona <strong className="text-white">"Añadir a pantalla de inicio"</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#C6A052] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Pulsa <strong className="text-white">"Añadir"</strong> para confirmar</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="w-full border-[#C6A052]/30 text-[#C0C0C0] text-xs"
              data-testid="button-ios-understood"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-[#C6A052]/10 p-2 rounded-lg shrink-0">
              <Download className="h-5 w-5 text-[#C6A052]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">Instala la app</p>
              <p className="text-[#C0C0C0] text-xs truncate">Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-[#C6A052] text-black hover:bg-[#C6A052]/90 text-xs px-3 h-8"
                data-testid="button-install-pwa"
              >
                Instalar
              </Button>
              <button
                onClick={handleDismiss}
                className="text-[#C0C0C0] hover:text-white p-1"
                data-testid="button-dismiss-pwa"
                title={remaining <= 1 ? "No volver a mostrar" : `Se mostrará ${remaining - 1} vez(es) más`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
