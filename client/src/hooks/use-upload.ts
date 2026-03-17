import { useState, useCallback } from "react";
import type { UppyFile } from "@uppy/core";

interface UploadMetadata {
  name: string;
  size: number;
  contentType: string;
}

interface UploadResponse {
  uploadURL?: string;
  objectPath: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(10);

        const token = localStorage.getItem("auth_token");

        const formData = new FormData();
        formData.append("file", file, file.name || "photo.jpg");
        if (token) {
          formData.append("token", token);
        }

        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        let uploadResponse: UploadResponse;

        try {
          uploadResponse = await new Promise<UploadResponse>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const pct = Math.round(10 + (event.loaded / event.total) * 85);
                setProgress(pct);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  resolve(data);
                } catch {
                  reject(new Error("Respuesta inválida del servidor"));
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.error || errorData.message || `Error ${xhr.status}`));
                } catch {
                  reject(new Error(`Error del servidor (${xhr.status})`));
                }
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("XHR_NETWORK_ERROR"));
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Subida cancelada"));
            });

            xhr.addEventListener("timeout", () => {
              reject(new Error("XHR_TIMEOUT"));
            });

            xhr.timeout = 120000;
            xhr.open("POST", "/api/uploads/direct");
            for (const [key, value] of Object.entries(headers)) {
              xhr.setRequestHeader(key, value);
            }
            xhr.send(formData);
          });
        } catch (xhrErr: any) {
          if (xhrErr?.message === "XHR_NETWORK_ERROR" || xhrErr?.message === "XHR_TIMEOUT") {
            console.log("XHR failed, trying fetch fallback...");
            setProgress(20);

            const fetchFormData = new FormData();
            fetchFormData.append("file", file, file.name || "photo.jpg");
            if (token) {
              fetchFormData.append("token", token);
            }

            const response = await fetch("/api/uploads/direct", {
              method: "POST",
              headers: headers,
              body: fetchFormData,
            });

            setProgress(90);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
            }

            uploadResponse = await response.json();
          } else {
            throw xhrErr;
          }
        }

        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error al subir archivo");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const requestUploadUrl = useCallback(
    async (file: File): Promise<UploadResponse> => {
      const token = localStorage.getItem("auth_token");
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      return response.json();
    },
    []
  );

  const getUploadParameters = useCallback(
    async (
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ): Promise<{
      method: "PUT";
      url: string;
      headers?: Record<string, string>;
    }> => {
      const token = localStorage.getItem("auth_token");
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data = await response.json();
      return {
        method: "PUT",
        url: data.uploadURL,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      };
    },
    []
  );

  return {
    uploadFile,
    getUploadParameters,
    isUploading,
    error,
    progress,
  };
}
