/**
 * 초급 예제 2: 간단한 챗봇 대화
 * OpenAI API를 사용하여 대화형 챗봇을 구현합니다.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES modules에서 __dirname 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
dotenv.config({ path: join(__dirname, '../../.env') });

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// readline 인터페이스 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 대화 히스토리 저장
const conversationHistory = [
  {
    role: 'system',
    content: '당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 대화하며, 사용자의 질문에 명확하고 유용한 답변을 제공합니다.'
  }
];

// 사용자 입력 받기
function askQuestion(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// 챗봇 응답 생성
async function getChatbotResponse(userMessage) {
  try {
    // 사용자 메시지를 히스토리에 추가
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });
    
    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistory,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const assistantMessage = completion.choices[0].message.content;
    
    // 어시스턴트 응답을 히스토리에 추가
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });
    
    return assistantMessage;
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    return '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
  }
}

// 대화 세션 정보 출력
function printSessionInfo() {
  console.log('\n=== 대화 세션 정보 ===');
  console.log(`총 메시지 수: ${conversationHistory.length}`);
  
  // 대략적인 토큰 수 계산 (한글은 대략 2-3자당 1토큰)
  const totalChars = conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0);
  const estimatedTokens = Math.floor(totalChars / 2.5);
  console.log(`예상 토큰 수: 약 ${estimatedTokens} 토큰`);
  console.log('====================\n');
}

// 메인 챗봇 루프
async function runChatbot() {
  console.log('=== 초급 예제 2: 대화형 챗봇 ===\n');
  console.log('AI 챗봇과 대화를 시작합니다.');
  console.log('종료하려면 "종료", "quit", 또는 "exit"를 입력하세요.');
  console.log('대화 내역을 보려면 "history"를 입력하세요.');
  console.log('세션 정보를 보려면 "info"를 입력하세요.\n');
  
  while (true) {
    const userInput = await askQuestion('\n사용자: ');
    
    // 종료 명령 확인
    if (['종료', 'quit', 'exit'].includes(userInput.toLowerCase())) {
      console.log('\n챗봇을 종료합니다. 감사합니다!');
      break;
    }
    
    // 히스토리 보기
    if (userInput.toLowerCase() === 'history') {
      console.log('\n=== 대화 내역 ===');
      conversationHistory.slice(1).forEach((msg, index) => {
        const role = msg.role === 'user' ? '사용자' : 'AI';
        console.log(`\n[${Math.floor(index/2) + 1}] ${role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      });
      continue;
    }
    
    // 세션 정보 보기
    if (userInput.toLowerCase() === 'info') {
      printSessionInfo();
      continue;
    }
    
    // 새 대화 시작
    if (userInput.toLowerCase() === 'new') {
      conversationHistory.length = 1; // 시스템 메시지만 유지
      console.log('\n새로운 대화를 시작합니다.');
      continue;
    }
    
    // 챗봇 응답 생성
    console.log('\nAI: 생각 중...');
    const response = await getChatbotResponse(userInput);
    console.log(`\nAI: ${response}`);
  }
  
  rl.close();
}

// 예제 대화 시나리오 실행 (데모 모드)
async function runDemoMode() {
  console.log('=== 데모 모드: 미리 정의된 대화 예제 ===\n');
  
  const demoQuestions = [
    '안녕하세요! 자기소개를 해주세요.',
    '오늘 날씨가 어떤가요?',
    'Python과 JavaScript의 차이점을 설명해주세요.',
    '감사합니다. 좋은 하루 되세요!'
  ];
  
  for (const question of demoQuestions) {
    console.log(`사용자: ${question}`);
    const response = await getChatbotResponse(question);
    console.log(`AI: ${response}\n`);
    
    // 잠시 대기 (읽기 편하도록)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('=== 데모 종료 ===\n');
}

// 실행 모드 선택
async function main() {
  console.log('OpenAI API를 사용한 챗봇 예제\n');
  
  const mode = await askQuestion('실행 모드를 선택하세요 (1: 대화형, 2: 데모): ');
  
  if (mode === '2') {
    await runDemoMode();
    rl.close();
  } else {
    await runChatbot();
  }
}

// 프로그램 시작
main().catch(console.error);
