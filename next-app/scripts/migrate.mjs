import { sql } from '@vercel/postgres';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const schemaPath = path.join(process.cwd(), 'next-app', 'schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');
  // Split on semicolons while preserving statement order
  const statements = ddl
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await sql.unsafe(stmt);
  }
  console.log('Migration completed.');
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});


