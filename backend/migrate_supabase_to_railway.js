const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Supabase Source Database Config
const supabaseConfig = {
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.rnrlwiocnhpwszranpqj',
  password: 'Mgplayz3d!213',
  ssl: { rejectUnauthorized: false }
};

// 2. Get Railway Target Connection URL from command line or env
const railwayUrl = process.argv[2] || process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL;

if (!railwayUrl) {
  console.error('\n[ERROR] Railway Connection URL is missing!');
  console.error('Usage: node migrate_supabase_to_railway.js "<RAILWAY_POSTGRESQL_URL>"');
  console.error('Example: node migrate_supabase_to_railway.js "postgresql://postgres:password@railway.proxy.rlwy.net:12345/railway"\n');
  process.exit(1);
}

async function migrate() {
  console.log('--- Database Migration: Supabase -> Railway ---');
  console.log('Connecting to Supabase (Source)...');
  const sourceClient = new Client(supabaseConfig);
  await sourceClient.connect();
  console.log('Connected to Supabase!');

  console.log('\nConnecting to Railway (Target)...');
  const targetClient = new Client({
    connectionString: railwayUrl,
    ssl: railwayUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
  });
  await targetClient.connect();
  console.log('Connected to Railway!');

  // Get all tables in public schema from Supabase
  const tablesRes = await sourceClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log('\nFound tables to migrate:', tables);

  for (const tableName of tables) {
    console.log(`\n----------------------------------------`);
    console.log(`Migrating table: "${tableName}"`);

    // 1. Get column definitions
    const colRes = await sourceClient.query(`
      SELECT column_name, data_type, udt_name, is_nullable, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    const columns = colRes.rows;
    console.log(`  Columns (${columns.length}):`, columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));

    // Get primary keys
    const pkRes = await sourceClient.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
    `, [tableName]);
    const pkColumns = pkRes.rows.map(r => r.column_name);

    // Build CREATE TABLE query for target
    const colDefs = columns.map(c => {
      let colType = c.udt_name === 'bytea' ? 'BYTEA' : (c.udt_name === 'varchar' ? 'VARCHAR(255)' : c.data_type.toUpperCase());
      if (c.udt_name === 'text') colType = 'TEXT';
      if (c.udt_name === 'int8') colType = 'BIGINT';
      if (c.udt_name === 'int4') colType = 'INTEGER';
      if (c.udt_name === 'timestamp' || c.udt_name === 'timestamptz') colType = 'TIMESTAMP';

      const nullability = c.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      return `"${c.column_name}" ${colType} ${nullability}`;
    });

    if (pkColumns.length > 0) {
      colDefs.push(`PRIMARY KEY (${pkColumns.map(p => `"${p}"`).join(', ')})`);
    }

    const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n);`;
    console.log(`  Creating table if not exists...`);
    await targetClient.query(createTableSql);

    // 2. Fetch all data rows from source
    const dataRes = await sourceClient.query(`SELECT * FROM "${tableName}"`);
    const rows = dataRes.rows;
    console.log(`  Source row count: ${rows.length}`);

    if (rows.length > 0) {
      const colNames = columns.map(c => c.column_name);
      const colNamesQuoted = colNames.map(c => `"${c}"`).join(', ');

      let insertedCount = 0;
      for (const row of rows) {
        const values = colNames.map(col => row[col]);
        const valuePlaceholders = colNames.map((_, idx) => `$${idx + 1}`).join(', ');

        let updateClause = '';
        if (pkColumns.length > 0) {
          const nonPkCols = colNames.filter(c => !pkColumns.includes(c));
          if (nonPkCols.length > 0) {
            updateClause = ` ON CONFLICT (${pkColumns.map(p => `"${p}"`).join(', ')}) DO UPDATE SET ` +
              nonPkCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');
          } else {
            updateClause = ` ON CONFLICT (${pkColumns.map(p => `"${p}"`).join(', ')}) DO NOTHING`;
          }
        }

        const insertSql = `INSERT INTO "${tableName}" (${colNamesQuoted}) VALUES (${valuePlaceholders})${updateClause}`;
        await targetClient.query(insertSql, values);
        insertedCount++;
      }
      console.log(`  Successfully inserted/updated ${insertedCount} rows in Railway.`);
    }

    // Verify row count in target
    const targetCountRes = await targetClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
    console.log(`  Railway row count: ${targetCountRes.rows[0].count}`);
  }

  await sourceClient.end();
  await targetClient.end();

  console.log('\n========================================');
  console.log(' Migration Completed Successfully! ');
  console.log('========================================\n');

  // Update application.properties
  updateApplicationProperties(railwayUrl);
}

function updateApplicationProperties(url) {
  const propsPath = path.join(__dirname, 'src', 'main', 'resources', 'application.properties');
  if (!fs.existsSync(propsPath)) {
    console.warn(`[WARN] ${propsPath} not found.`);
    return;
  }

  let content = fs.readFileSync(propsPath, 'utf8');

  // Parse railway URL for JDBC format
  // URL standard: postgresql://user:password@host:port/dbname
  try {
    let cleanUrl = url.replace(/^jdbc:/, '');
    const parsed = new URL(cleanUrl);

    const host = parsed.hostname;
    const port = parsed.port || '5432';
    const database = parsed.pathname.replace(/^\//, '') || 'railway';
    const username = parsed.username || 'postgres';
    const password = parsed.password || '';

    const jdbcUrl = `jdbc:postgresql://${host}:${port}/${database}?prepareThreshold=0`;

    console.log('Updating backend application.properties with Railway credentials...');
    console.log(`  JDBC URL: ${jdbcUrl}`);
    console.log(`  Username: ${username}`);

    content = content.replace(/spring\.datasource\.url=.*/g, `spring.datasource.url=${jdbcUrl}`);
    content = content.replace(/spring\.datasource\.username=.*/g, `spring.datasource.username=${username}`);
    content = content.replace(/spring\.datasource\.password=.*/g, `spring.datasource.password=${password}`);

    fs.writeFileSync(propsPath, content, 'utf8');
    console.log('application.properties updated successfully!');
  } catch (err) {
    console.error('Failed to parse Railway URL for application.properties:', err.message);
  }
}

migrate().catch(err => {
  console.error('\n[FATAL ERROR] Migration failed:', err);
  process.exit(1);
});
