import "dotenv/config";
import { Pool, PoolClient } from "pg";

interface TableInfo {
  name: string;
}

interface ColumnInfo {
  name: string;
}

function getConfig() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

  if (!sourceUrl) {
    throw new Error("SOURCE_DATABASE_URL is required");
  }
  if (!targetUrl) {
    throw new Error("TARGET_DATABASE_URL or DATABASE_URL is required");
  }

  return { sourceUrl, targetUrl };
}

function qIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function getPublicBaseTables(client: PoolClient): Promise<TableInfo[]> {
  const result = await client.query<TableInfo>(`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.rows;
}

async function getColumns(client: PoolClient, tableName: string): Promise<ColumnInfo[]> {
  const result = await client.query<ColumnInfo>(
    `
      SELECT column_name AS name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );
  return result.rows;
}

async function setSequences(client: PoolClient): Promise<void> {
  const result = await client.query<{
    table_name: string;
    column_name: string;
    sequence_name: string;
  }>(`
    SELECT
      c.table_name,
      c.column_name,
      pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name) AS sequence_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_default LIKE 'nextval%'
  `);

  for (const row of result.rows) {
    if (!row.sequence_name) continue;
    const table = `${qIdent("public")}.${qIdent(row.table_name)}`;
    const column = qIdent(row.column_name);
    await client.query(
      `SELECT setval($1, COALESCE((SELECT MAX(${column}) FROM ${table}), 1), (SELECT COUNT(*) > 0 FROM ${table}))`,
      [row.sequence_name]
    );
  }
}

async function copyTableData(
  source: PoolClient,
  target: PoolClient,
  tableName: string,
  batchSize = 500
): Promise<number> {
  const columns = await getColumns(source, tableName);
  if (columns.length === 0) return 0;

  const columnNames = columns.map((c) => c.name);
  const quotedColumns = columnNames.map(qIdent).join(", ");

  const selectQuery = `SELECT ${quotedColumns} FROM ${qIdent("public")}.${qIdent(tableName)}`;
  const rowsResult = await source.query(selectQuery);
  const rows = rowsResult.rows;
  if (rows.length === 0) return 0;

  for (const chunk of chunkArray(rows, batchSize)) {
    const values: unknown[] = [];
    const valueGroups: string[] = [];

    for (const row of chunk) {
      const placeholders: string[] = [];
      for (const column of columnNames) {
        values.push(row[column]);
        placeholders.push(`$${values.length}`);
      }
      valueGroups.push(`(${placeholders.join(", ")})`);
    }

    const insertQuery = `
      INSERT INTO ${qIdent("public")}.${qIdent(tableName)} (${quotedColumns})
      VALUES ${valueGroups.join(", ")}
    `;

    await target.query(insertQuery, values);
  }

  return rows.length;
}

async function run() {
  const { sourceUrl, targetUrl } = getConfig();
  const sourcePool = new Pool({ connectionString: sourceUrl });
  const targetPool = new Pool({ connectionString: targetUrl });

  let sourceClient: PoolClient | null = null;
  let targetClient: PoolClient | null = null;

  try {
    sourceClient = await sourcePool.connect();
    targetClient = await targetPool.connect();

    const sourceDb = await sourceClient.query<{ current_database: string }>(
      "SELECT current_database() AS current_database"
    );
    const targetDb = await targetClient.query<{ current_database: string }>(
      "SELECT current_database() AS current_database"
    );

    console.log(`Source DB: ${sourceDb.rows[0].current_database}`);
    console.log(`Target DB: ${targetDb.rows[0].current_database}`);
    console.log("Replacing 100% of local data with source data...");

    const [sourceTables, targetTables] = await Promise.all([
      getPublicBaseTables(sourceClient),
      getPublicBaseTables(targetClient),
    ]);

    const sourceTableNames = new Set(sourceTables.map((t) => t.name));
    const copyTables = targetTables
      .map((t) => t.name)
      .filter((name) => sourceTableNames.has(name))
      .filter((name) => name !== "__drizzle_migrations")
      .sort();

    if (copyTables.length === 0) {
      throw new Error("No common public tables found between source and target");
    }

    await targetClient.query("BEGIN");
    await targetClient.query("SET CONSTRAINTS ALL DEFERRED");

    const truncateSql = `TRUNCATE TABLE ${copyTables
      .map((name) => `${qIdent("public")}.${qIdent(name)}`)
      .join(", ")} RESTART IDENTITY CASCADE`;
    await targetClient.query(truncateSql);

    let totalRows = 0;
    for (const tableName of copyTables) {
      const inserted = await copyTableData(sourceClient, targetClient, tableName);
      totalRows += inserted;
      console.log(`- ${tableName}: ${inserted} rows copied`);
    }

    await setSequences(targetClient);
    await targetClient.query("COMMIT");

    console.log(`Done. Tables copied: ${copyTables.length}. Total rows copied: ${totalRows}`);
  } catch (error) {
    if (targetClient) {
      await targetClient.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (sourceClient) sourceClient.release();
    if (targetClient) targetClient.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

run().catch((error) => {
  console.error("Replace operation failed:", error);
  process.exit(1);
});
