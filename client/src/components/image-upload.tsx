import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
  label?: string;
  shape?: "circle" | "square";
  size?: "sm" | "md" | "lg";
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  onUploadingChange,
  label = "Subir imagen",
  shape = "square",
  size = "md",
  accept = "image/*",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      const objectPath = response.objectPath;
      onChange(objectPath);
      setPreview(null);
    },
    onError: (error) => {
      setPreview(null);
      toast({
        title: "Error al subir imagen",
        description: error.message || "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-md";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    await uploadFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    onRemove?.();
  };

  const displayUrl = preview || value;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative ${sizeClasses[size]} ${shapeClass} border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden cursor-pointer`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        data-testid="image-upload-area"
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt="Preview"
            className={`h-full w-full object-cover ${shapeClass}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Camera className="h-6 w-6" />
            <span className="text-xs text-center px-1">{label}</span>
          </div>
        )}

        {displayUrl && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            data-testid="button-remove-image"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      {!displayUrl && !isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          data-testid="button-upload-image"
        >
          <Upload className="h-4 w-4 mr-2" />
          {label}
        </Button>
      )}
    </div>
  );
}
