// テスト用スクリプト：参加表明とマイページデータ取得をテスト
const { joinEvent, getParticipantsByUserId } = require('./src/lib/database.ts');

async function testParticipation() {
  console.log('=== 参加表明テスト開始 ===');
  
  // テストデータ
  const eventId = 'current_event_1';
  const userId = '12345678'; // 田中太郎
  const userData = {
    user_x_id: userId,
    user_x_name: '田中太郎',
    user_x_icon_url: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=田'
  };
  
  try {
    // 1. 現在の参加状況を確認
    console.log('\n1. 参加表明前の状況確認');
    const beforeParticipants = await getParticipantsByUserId(userId);
    console.log('参加前の参加イベント数:', beforeParticipants.length);
    
    // 2. 参加表明を実行
    console.log('\n2. 参加表明実行');
    const joinResult = await joinEvent(eventId, userData);
    console.log('参加表明結果:', joinResult);
    
    // 3. 参加後の状況を確認
    console.log('\n3. 参加表明後の状況確認');
    const afterParticipants = await getParticipantsByUserId(userId);
    console.log('参加後の参加イベント数:', afterParticipants.length);
    console.log('参加後のイベント詳細:', afterParticipants);
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  console.log('\n=== 参加表明テスト終了 ===');
}

testParticipation();