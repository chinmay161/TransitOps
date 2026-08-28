require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // 1. Get fuel_logs columns
  const cols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'fuel_logs'
    ORDER BY ordinal_position
  `);
  console.log('=== fuel_logs columns ===');
  for (const c of cols.rows) {
    console.log(`  ${c.column_name}: ${c.data_type} nullable=${c.is_nullable} default=${c.column_default ?? 'null'}`);
  }
  console.log(`  Total: ${cols.rows.length} columns`);

  // 2. Get constraints on fuel_logs
  const constraints = await pool.query(`
    SELECT conname, contype, pg_get_constraintdef(oid) as def
    FROM pg_constraint
    WHERE conrelid = 'fuel_logs'::regclass
    ORDER BY contype, conname
  `);
  console.log('\n=== fuel_logs constraints ===');
  for (const c of constraints.rows) {
    console.log(`  [${c.contype}] ${c.conname}: ${c.def}`);
  }

  // 3. Get indexes on fuel_logs
  const indexes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'fuel_logs'
    ORDER BY indexname
  `);
  console.log('\n=== fuel_logs indexes ===');
  for (const i of indexes.rows) {
    console.log(`  ${i.indexname}: ${i.indexdef}`);
  }

  // 4. Count rows
  const count = await pool.query('SELECT count(*)::int as cnt FROM fuel_logs');
  console.log(`\n=== fuel_logs row count: ${count.rows[0].cnt} ===`);

  // 5. Check which tables exist
  const tables = await pool.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `);
  console.log('\n=== all public tables ===');
  for (const t of tables.rows) {
    console.log(`  ${t.tablename}`);
  }

  await pool.end();
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
