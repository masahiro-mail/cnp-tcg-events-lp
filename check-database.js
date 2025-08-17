const { Pool } = require('pg');

async function checkDatabase() {
  const databaseUrl = 'postgresql://postgres:fJhmXsQEtIhHHHWqSrJvhCjYLEbqMFLD@junction.proxy.rlwy.net:25061/railway';
  
  console.log('🔍 Connecting to PostgreSQL...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 5
  });

  try {
    const client = await pool.connect();
    
    try {
      // 接続テスト
      console.log('✅ Connected to PostgreSQL');
      
      // テーブル確認
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      console.log('📊 Tables found:', tables);
      
      // 各テーブルの件数確認
      for (const tableName of tables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
          console.log(`📈 ${tableName}: ${countResult.rows[0].count} rows`);
        } catch (error) {
          console.error(`❌ Error counting ${tableName}:`, error.message);
        }
      }
      
      // participantsテーブルの詳細確認
      if (tables.includes('participants')) {
        console.log('\n🔍 Checking participants table structure...');
        const structureResult = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'participants'
          ORDER BY ordinal_position
        `);
        
        console.log('📋 Participants table structure:');
        structureResult.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
        console.log('\n📄 Recent participants data:');
        const participantsResult = await client.query(`
          SELECT * FROM participants 
          ORDER BY created_at DESC 
          LIMIT 10
        `);
        
        if (participantsResult.rows.length === 0) {
          console.log('❌ No participants found in database');
        } else {
          participantsResult.rows.forEach(row => {
            console.log(`  - ${row.user_x_name} (${row.user_x_id}) joined ${row.event_id} at ${row.created_at}`);
          });
        }
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();