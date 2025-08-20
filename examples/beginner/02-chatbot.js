/**
 * 초급 예제 2: 간단한 챗봇 대화
 * OpenAI API를 사용하여 대화형 챗봇을 구현합니다.
 * 
 * 이 예제에서는 다음을 학습합니다:
 * 1. 대화형 인터페이스 구현 (readline 사용)
 * 2. 대화 히스토리 관리 및 컨텍스트 유지
 * 3. 특별 명령어 처리 (history, info, new 등)
 * 4. 데모 모드와 대화형 모드의 분리
 * 5. 비동기 처리와 Promise 활용
 * 6. 토큰 사용량 추정 및 세션 관리
 */

// OpenAI 라이브러리 - AI 모델과 대화하기 위한 도구
import OpenAI from 'openai';
// 환경 변수 관리 - API 키 등을 안전하게 저장
import dotenv from 'dotenv';
// readline - 터미널에서 사용자 입력을 받기 위한 Node.js 내장 모듈
import readline from 'readline';
// ES 모듈에서 파일 경로를 다루기 위한 Node.js 내장 모듈들
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES 모듈에서는 __dirname이 기본적으로 제공되지 않아서 직접 만들어야 합니다
// __filename: 현재 파일의 절대 경로
const __filename = fileURLToPath(import.meta.url);
// __dirname: 현재 파일이 있는 폴더의 절대 경로
const __dirname = dirname(__filename);

// .env 파일에서 환경 변수들을 읽어와서 process.env에 로드합니다
// 이렇게 하면 API 키 같은 민감한 정보를 코드에 직접 쓰지 않아도 됩니다
dotenv.config({ path: join(__dirname, '../../.env') });

// OpenAI API 클라이언트를 초기화합니다
// process.env.OPENAI_API_KEY에서 API 키를 가져와서 설정합니다
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 파일에 저장된 API 키
});

// ===== 사용자 입력 처리 설정 =====

// readline 인터페이스를 설정합니다
// 이 인터페이스를 통해 터미널에서 사용자 입력을 받을 수 있습니다
const rl = readline.createInterface({
  input: process.stdin,   // 표준 입력 (키보드)
  output: process.stdout  // 표준 출력 (터미널 화면)
});

// ===== 대화 히스토리 관리 =====

// 대화 히스토리를 저장하는 배열입니다
// OpenAI API는 이전 대화 내용을 기억하여 맥락을 유지할 수 있습니다
const conversationHistory = [
  {
    role: 'system',        // 시스템 역할: AI의 기본 성격과 행동을 정의
    content: '당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 대화하며, 사용자의 질문에 명확하고 유용한 답변을 제공합니다.'
  }
  // 참고: 시스템 메시지는 항상 첫 번째에 위치하며, AI의 기본 설정을 담당합니다
];

// ===== 핵심 함수들 =====

/**
 * 사용자로부터 입력을 받는 함수
 * @param {string} prompt - 사용자에게 보여줄 질문이나 안내 메시지
 * @returns {Promise<string>} - 사용자가 입력한 답변
 * 
 * Promise를 사용하는 이유: readline.question은 비동기적으로 동작하기 때문입니다
 */
function askQuestion(prompt) {
  return new Promise((resolve) => {
    // rl.question은 콜백 함수를 사용하여 사용자 입력을 받습니다
    rl.question(prompt, (answer) => {
      resolve(answer); // Promise를 resolve하여 입력값을 반환합니다
    });
  });
}

/**
 * OpenAI API를 사용하여 챗봇 응답을 생성하는 함수
 * @param {string} userMessage - 사용자가 입력한 메시지
 * @returns {Promise<string>} - AI가 생성한 응답
 */
async function getChatbotResponse(userMessage) {
  try {
    // ===== 1단계: 대화 히스토리에 사용자 메시지 추가 =====
    conversationHistory.push({
      role: 'user',           // 사용자 역할
      content: userMessage    // 사용자가 입력한 내용
    });
    
    // ===== 2단계: OpenAI API 호출하여 응답 생성 =====
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',        // 사용할 AI 모델
      messages: conversationHistory,  // 전체 대화 히스토리를 전송 (컨텍스트 유지)
      max_tokens: 500,                // AI가 생성할 수 있는 최대 토큰 수
      temperature: 0.7,               // 창의성 조절 (0.7: 적당히 창의적이면서 일관성 유지)
    });
    
    // AI가 생성한 응답을 추출합니다
    const assistantMessage = completion.choices[0].message.content;
    
    // ===== 3단계: AI 응답을 대화 히스토리에 추가 =====
    // 이렇게 하면 다음 대화에서 AI가 이전 응답을 기억할 수 있습니다
    conversationHistory.push({
      role: 'assistant',      // AI 어시스턴트 역할
      content: assistantMessage  // AI가 생성한 응답
    });
    
    return assistantMessage;  // 응답을 반환합니다
    
  } catch (error) {
    // 오류가 발생했을 때 처리
    console.error('오류 발생:', error.message);
    
    // 사용자에게 친화적인 오류 메시지를 반환합니다
    return '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
  }
}

/**
 * 현재 대화 세션의 정보를 출력하는 함수
 * 대화 통계와 예상 토큰 사용량을 보여줍니다
 */
function printSessionInfo() {
  console.log('\n=== 대화 세션 정보 ===');
  console.log(`총 메시지 수: ${conversationHistory.length}`);
  
  // 대략적인 토큰 수를 계산합니다
  // OpenAI API는 토큰 단위로 요금을 계산하므로 비용 추정에 중요합니다
  const totalChars = conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0);
  const estimatedTokens = Math.floor(totalChars / 2.5);  // 한글은 대략 2-3자당 1토큰
  
  console.log(`예상 토큰 수: 약 ${estimatedTokens} 토큰`);
  console.log('====================\n');
}

// ===== 메인 챗봇 실행 로직 =====

/**
 * 대화형 챗봇의 메인 루프를 실행하는 함수
 * 사용자 입력을 받고 AI 응답을 생성하는 무한 루프입니다
 */
async function runChatbot() {
  console.log('=== 초급 예제 2: 대화형 챗봇 ===\n');
  console.log('AI 챗봇과 대화를 시작합니다.');
  console.log('종료하려면 "종료", "quit", 또는 "exit"를 입력하세요.');
  console.log('대화 내역을 보려면 "history"를 입력하세요.');
  console.log('세션 정보를 보려면 "info"를 입력하세요.\n');
  
  // 무한 루프: 사용자가 종료할 때까지 계속 대화를 진행합니다
  while (true) {
    // 사용자로부터 입력을 받습니다
    const userInput = await askQuestion('\n사용자: ');
    
    // ===== 특별 명령어 처리 =====
    
    // 1. 종료 명령 확인 (대소문자 구분 없이)
    if (['종료', 'quit', 'exit'].includes(userInput.toLowerCase())) {
      console.log('\n챗봇을 종료합니다. 감사합니다!');
      break;  // while 루프를 빠져나갑니다
    }
    
    // 2. 대화 히스토리 보기 명령
    if (userInput.toLowerCase() === 'history') {
      console.log('\n=== 대화 내역 ===');
      
      // conversationHistory.slice(1)로 첫 번째 시스템 메시지는 제외
      // forEach를 사용하여 각 메시지를 순서대로 출력
      conversationHistory.slice(1).forEach((msg, index) => {
        const role = msg.role === 'user' ? '사용자' : 'AI';  // 역할을 한글로 표시
        
        // 메시지가 100자보다 길면 "..."을 추가하여 가독성 향상
        const displayContent = msg.content.length > 100 
          ? msg.content.substring(0, 100) + '...' 
          : msg.content;
        
        // 대화 번호는 2로 나누어 계산 (사용자+AI = 1회 대화)
        console.log(`\n[${Math.floor(index/2) + 1}] ${role}: ${displayContent}`);
      });
      
      continue;  // 다음 루프로 넘어갑니다 (AI 응답 생성하지 않음)
    }
    
    // 3. 세션 정보 보기 명령
    if (userInput.toLowerCase() === 'info') {
      printSessionInfo();  // 세션 정보 출력 함수 호출
      continue;  // 다음 루프로 넘어갑니다
    }
    
    // 4. 새 대화 시작 명령
    if (userInput.toLowerCase() === 'new') {
      // conversationHistory.length = 1로 설정하여 시스템 메시지만 유지
      // 이렇게 하면 이전 대화 내용은 모두 지워지고 새로운 대화를 시작할 수 있습니다
      conversationHistory.length = 1;
      console.log('\n새로운 대화를 시작합니다.');
      continue;  // 다음 루프로 넘어갑니다
    }
    
    // ===== 일반 대화 처리 =====
    
    // 특별 명령어가 아닌 경우, AI에게 응답을 요청합니다
    console.log('\nAI: 생각 중...');  // 사용자에게 AI가 생각하고 있다는 것을 알림
    
    // OpenAI API를 호출하여 AI 응답을 생성합니다
    const response = await getChatbotResponse(userInput);
    
    // AI 응답을 출력합니다
    console.log(`\nAI: ${response}`);
  }
  
  // while 루프가 끝나면 readline 인터페이스를 종료합니다
  // 이렇게 하면 프로그램이 깔끔하게 종료됩니다
  rl.close();
}

// ===== 데모 모드 =====

/**
 * 미리 정의된 대화 시나리오를 자동으로 실행하는 데모 모드
 * 챗봇의 기능을 빠르게 확인하거나 테스트할 때 유용합니다
 */
async function runDemoMode() {
  console.log('=== 데모 모드: 미리 정의된 대화 예제 ===\n');
  
  // 데모에서 사용할 질문들을 배열로 정의합니다
  const demoQuestions = [
    '안녕하세요! 자기소개를 해주세요.',
    '오늘 날씨가 어떤가요?',
    'Python과 JavaScript의 차이점을 설명해주세요.',
    '감사합니다. 좋은 하루 되세요!'
  ];
  
  // 각 질문에 대해 순차적으로 AI 응답을 생성합니다
  for (const question of demoQuestions) {
    console.log(`사용자: ${question}`);  // 질문을 출력
    
    // AI 응답을 생성하고 출력합니다
    const response = await getChatbotResponse(question);
    console.log(`AI: ${response}\n`);
    
    // 1초간 대기하여 읽기 편하게 만듭니다
    // setTimeout을 Promise로 감싸서 async/await와 함께 사용
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('=== 데모 종료 ===\n');
}

// ===== 프로그램 실행 제어 =====

/**
 * 메인 함수: 사용자가 실행 모드를 선택하고 해당 모드를 실행합니다
 */
async function main() {
  console.log('OpenAI API를 사용한 챗봇 예제\n');
  
  // 사용자에게 실행 모드를 선택하도록 요청합니다
  const mode = await askQuestion('실행 모드를 선택하세요 (1: 대화형, 2: 데모): ');
  
  // 선택된 모드에 따라 다른 함수를 실행합니다
  if (mode === '2') {
    await runDemoMode();    // 데모 모드 실행
    rl.close();             // 데모 완료 후 readline 종료
  } else {
    await runChatbot();     // 대화형 모드 실행 (기본값)
  }
}

// ===== 프로그램 시작 =====

// 메인 함수를 실행하고 오류가 발생하면 콘솔에 출력합니다
// .catch(console.error)는 Promise에서 발생한 오류를 처리하는 방법입니다
main().catch(console.error);
