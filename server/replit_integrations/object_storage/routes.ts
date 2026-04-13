import type { Express } from "express";
import multer from "multer";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";
import { randomUUID } from "crypto";
import { verifyToken, type JWTPayload } from "../../auth";
import fs from "fs";
import path from "path";

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();
  const uploadsDir = path.resolve(process.cwd(), "attached_assets", "replit_images", "uploads");

  const tryResolveLegacyUpload = (reqPath: string): string | null => {
    const match = reqPath.match(/^\/uploads\/([^/?]+)/);
    if (!match) return null;

    const objectId = match[1];
    if (!fs.existsSync(uploadsDir)) return null;

    const files = fs.readdirSync(uploadsDir);
    const matchingFile = files.find((file) => file.includes(objectId) || file.startsWith(objectId));
    if (!matchingFile) return null;

    return path.join(uploadsDir, matchingFile);
  };
  const ALLOWED_MIMES = [
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence",
    "image/bmp", "image/tiff", "image/avif",
    "video/mp4", "video/quicktime", "video/3gpp",
    "application/octet-stream",
  ];

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIMES.includes(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de archivo no permitido"));
      }
    },
  });

  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.post("/api/uploads/direct", (req, res, next) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        console.error("Multer error:", err.message, "code:", err.code);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "El archivo es demasiado grande (máximo 10MB)" });
        }
        return res.status(400).json({ error: err.message || "Error al procesar el archivo" });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      if (!token && req.body?.token) {
        token = req.body.token;
      }
      if (token) {
        const payload = verifyToken(token);
        if (!payload) {
          return res.status(401).json({ error: "Token inválido" });
        }
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const privateObjectDir = objectStorageService.getPrivateObjectDir();
      const objectId = randomUUID();
      const fullPath = `${privateObjectDir}/uploads/${objectId}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);

      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      await file.save(req.file.buffer, {
        contentType: req.file.mimetype || "application/octet-stream",
        resumable: false,
      });

      const objectPath = `/objects/uploads/${objectId}`;

      res.json({
        objectPath,
        metadata: {
          name: req.file.originalname,
          size: req.file.size,
          contentType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.use("/objects", async (req, res, next) => {
    if (req.method !== "GET") return next();

    // In migrated environments, serve legacy /objects/uploads directly from local assets.
    const localLegacyFile = tryResolveLegacyUpload(req.path);
    if (localLegacyFile) {
      return res.sendFile(localLegacyFile);
    }

    // If object storage is not configured, return 404 for legacy uploads that
    // are not present locally instead of throwing noisy configuration errors.
    if (!process.env.PRIVATE_OBJECT_DIR && req.path.startsWith("/uploads/")) {
      return res.status(404).json({ error: "Object not found" });
    }

    try {
      const fullPath = `/objects${req.path}`;
      const objectFile = await objectStorageService.getObjectEntityFile(fullPath);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      console.error("Error serving object:", error);
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
