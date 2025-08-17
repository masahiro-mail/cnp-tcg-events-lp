import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Environment Debug API called');
    
    const envInfo = {
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      database_url_exists: !!process.env.DATABASE_URL,
      database_url_length: process.env.DATABASE_URL?.length || 0,
      database_url_prefix: process.env.DATABASE_URL?.substring(0, 30) || 'Not set',
      database_url_contains_localhost: process.env.DATABASE_URL?.includes('localhost') || false,
      database_url_contains_railway: process.env.DATABASE_URL?.includes('railway') || false,
      database_url_protocol: process.env.DATABASE_URL?.split('://')[0] || 'unknown',
      railway_environment: process.env.RAILWAY_ENVIRONMENT || 'not set',
      railway_project_id: process.env.RAILWAY_PROJECT_ID || 'not set',
      railway_service_id: process.env.RAILWAY_SERVICE_ID || 'not set',
      // 最後の30文字を表示（接続情報の一部を確認）
      database_url_suffix: process.env.DATABASE_URL ? 
        '...' + process.env.DATABASE_URL.slice(-30) : 'Not set'
    };

    // DATABASE_URLの詳細パース（セキュリティを考慮）
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        envInfo.parsed_url = {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port || 'default',
          database: url.pathname.substring(1), // Remove leading /
          username: url.username ? '***' : 'none',
          password: url.password ? '***' : 'none'
        };
      } catch (parseError) {
        envInfo.url_parse_error = 'Invalid URL format';
      }
    }

    console.log('🔍 Environment Info:', envInfo);
    
    return NextResponse.json({
      success: true,
      environment: envInfo
    });
    
  } catch (error: any) {
    console.error('❌ Environment Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Environment debug error',
      message: error.message
    }, { status: 500 });
  }
}