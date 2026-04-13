import "dotenv/config";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface MigrationStats {
  totalImages: number;
  updated: number;
  failed: number;
  errors: string[];
}

const stats: MigrationStats = {
  totalImages: 0,
  updated: 0,
  failed: 0,
  errors: [],
};

// Map /objects/uploads/{uuid} URLs to local /attached_assets/replit_images/uploads/{filename}
function mapUrlToLocal(url: string): string | null {
  if (!url) return null;

  // Extract UUID from /objects/uploads/{uuid} pattern
  const match = url.match(/\/objects\/uploads\/([^\/\?]+)/);
  if (!match) {
    console.warn(`Could not extract UUID from URL: ${url}`);
    return null;
  }

  const uuid = match[1];

  // Search for matching file in uploads directory
  const uploadsDir = path.join(
    process.cwd(),
    "attached_assets",
    "replit_images",
    "uploads"
  );

  try {
    const files = fs.readdirSync(uploadsDir);
    const matchingFile = files.find(
      (f) => f.includes(uuid) || f.startsWith(uuid)
    );

    if (!matchingFile) {
      console.warn(`No file found for UUID: ${uuid}`);
      return null;
    }

    return `/attached_assets/replit_images/uploads/${matchingFile}`;
  } catch (error) {
    console.error(`Error searching for file with UUID ${uuid}:`, error);
    return null;
  }
}

async function migrateTable(
  tableName: string,
  columnCandidates: string[],
  isArray: boolean = false
) {
  try {
    const columnResult = await pool.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = ANY($2::text[])
       LIMIT 1`,
      [tableName, columnCandidates]
    );

    if (columnResult.rows.length === 0) {
      const errorMsg = `Skipping ${tableName}: none of these columns exist [${columnCandidates.join(", ")}]`;
      console.warn(errorMsg);
      stats.errors.push(errorMsg);
      return;
    }

    const columnName = columnResult.rows[0].column_name;

    console.log(
      `\nMigrating ${tableName}.${columnName}${isArray ? " (array)" : ""}...`
    );

    // Fetch all rows with image URLs
    const query = `SELECT id, "${columnName}" FROM "${tableName}" WHERE "${columnName}" IS NOT NULL`;
    const result = await pool.query(query);

    console.log(`Found ${result.rows.length} rows with images`);

    for (const row of result.rows) {
      const id = row.id;
      let urls = row[columnName];

      if (!urls) continue;

      let updated = false;
      let newUrls: string[] = [];

      if (isArray) {
        // Handle array of URLs
        if (!Array.isArray(urls)) {
          urls = [urls];
        }

        for (const url of urls) {
          const localUrl = mapUrlToLocal(url);
          if (localUrl) {
            newUrls.push(localUrl);
            updated = true;
            stats.updated++;
            console.log(
              `  ✓ Mapped: ${url.substring(0, 50)}... → ${localUrl}`
            );
          } else {
            newUrls.push(url); // Keep original if mapping failed
            stats.failed++;
          }
        }
      } else {
        // Handle single URL
        const localUrl = mapUrlToLocal(urls);
        if (localUrl) {
          newUrls = [localUrl];
          updated = true;
          stats.updated++;
          console.log(`  ✓ Mapped: ${urls.substring(0, 50)}... → ${localUrl}`);
        } else {
          newUrls = [urls];
          stats.failed++;
        }
      }

      // Update database
      if (updated) {
        const updateQuery = `UPDATE "${tableName}" SET "${columnName}" = $1 WHERE id = $2`;
        const updateValue = isArray ? newUrls : newUrls[0];
        await pool.query(updateQuery, [updateValue, id]);
      }

      stats.totalImages++;
    }
  } catch (error) {
    const errorMsg = `Error migrating ${tableName} [${columnCandidates.join(", ")}]: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }
}

async function main() {
  console.log("Starting image migration to local filesystem...\n");

  try {
    // List of tables and columns to migrate
    const columnsToMigrate = [
      { table: "teams", columns: ["logo_url", "logoUrl"], isArray: false },
      { table: "players", columns: ["photo_urls", "photoUrls"], isArray: true },
      { table: "matches", columns: ["vs_image_url", "vsImageUrl"], isArray: false },
      { table: "news", columns: ["image_url", "imageUrl"], isArray: false },
      { table: "expenses", columns: ["receipt_url", "receiptUrl"], isArray: false },
      { table: "marketing_media", columns: ["url"], isArray: false },
      { table: "marketing_media", columns: ["thumbnail_url"], isArray: false },
      { table: "site_settings", columns: ["logo_url", "logoUrl"], isArray: false },
    ];

    for (const { table, columns, isArray } of columnsToMigrate) {
      await migrateTable(table, columns, isArray);
    }

    console.log("\n" + "=".repeat(60));
    console.log("Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total images processed: ${stats.totalImages}`);
    console.log(`Successfully mapped: ${stats.updated}`);
    console.log(`Failed to map: ${stats.failed}`);

    if (stats.errors.length > 0) {
      console.log("\nErrors encountered:");
      stats.errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log("=".repeat(60));
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
