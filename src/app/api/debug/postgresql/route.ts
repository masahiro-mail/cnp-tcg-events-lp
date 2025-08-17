import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    console.log('🔍 PostgreSQL診断API開始');
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database_url_configured: !!process.env.DATABASE_URL
    };

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not configured',
        diagnostics
      });
    }

    // DATABASE_URLの基本情報
    try {
      const url = new URL(process.env.DATABASE_URL);
      diagnostics.connection_info = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || '5432',
        database: url.pathname.substring(1),
        is_localhost: url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1',
        is_railway: url.hostname.includes('railway'),
        full_hostname: url.hostname
      };
    } catch (urlError) {
      diagnostics.url_parse_error = urlError.message;
      return NextResponse.json({
        success: false,
        error: 'Invalid DATABASE_URL format',
        diagnostics
      });
    }

    // PostgreSQL接続テスト（複数の設定で試行）
    const connectionConfigs = [
      {
        name: 'Default Config',
        config: {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          max: 1
        }
      },
      {
        name: 'Force SSL Config',
        config: {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          max: 1
        }
      },
      {
        name: 'No SSL Config',
        config: {
          connectionString: process.env.DATABASE_URL,
          ssl: false,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          max: 1
        }
      }
    ];

    diagnostics.connection_tests = [];

    for (const { name, config } of connectionConfigs) {
      const testResult: any = { config_name: name };
      
      try {
        console.log(`🔗 Testing ${name}...`);
        const pool = new Pool(config);
        
        const client = await pool.connect();
        
        try {
          const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
          testResult.status = 'SUCCESS';
          testResult.server_time = result.rows[0].current_time;
          testResult.pg_version = result.rows[0].pg_version;
          
          // 追加テスト: participantsテーブル存在確認
          const tableCheck = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'participants'
            ) as table_exists
          `);
          testResult.participants_table_exists = tableCheck.rows[0].table_exists;
          
        } finally {
          client.release();
          await pool.end();
        }
        
      } catch (error: any) {
        testResult.status = 'FAILED';
        testResult.error = error.message;
        testResult.error_code = error.code;
        testResult.error_detail = error.detail;
      }
      
      diagnostics.connection_tests.push(testResult);
    }

    // 成功したテストがあるかチェック
    const successfulTests = diagnostics.connection_tests.filter(t => t.status === 'SUCCESS');
    diagnostics.has_successful_connection = successfulTests.length > 0;
    
    if (successfulTests.length > 0) {
      diagnostics.recommended_config = successfulTests[0].config_name;
    }

    return NextResponse.json({
      success: diagnostics.has_successful_connection,
      message: diagnostics.has_successful_connection ? 
        'PostgreSQL connection successful' : 
        'All PostgreSQL connection attempts failed',
      diagnostics
    });
    
  } catch (error: any) {
    console.error('❌ PostgreSQL診断エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'PostgreSQL diagnostic error',
      message: error.message
    }, { status: 500 });
  }
}