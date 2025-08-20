/**
 * 중급 예제 2: 스트리밍 응답
 * OpenAI API의 스트리밍 기능을 사용하여 실시간으로 응답을 받습니다.
 * 
 * 이 예제에서는 다음을 학습합니다:
 * 1. 스트리밍의 개념과 장점 (실시간 응답, 사용자 경험 향상)
 * 2. for await...of 루프를 사용한 스트림 처리
 * 3. 프로그레스 인디케이터 구현 (로딩 애니메이션)
 * 4. 멀티턴 대화에서의 스트리밍 활용
 * 5. AbortController를 사용한 스트리밍 중단
 * 6. JSON 모드에서의 스트리밍 처리
 * 7. 통계 정보 수집 및 성능 측정
 * 
 * 스트리밍이란?
 * - AI가 응답을 생성하는 동안 실시간으로 텍스트를 받아볼 수 있는 기능
 * - 전체 응답을 기다리지 않고 부분적으로 표시하여 사용자 경험 향상
 * - 긴 응답에서 특히 유용 (사용자가 기다리는 시간 단축)
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

// ===== 스트리밍 콘솔 헬퍼 클래스 =====

/**
 * 스트리밍 출력을 관리하고 통계를 수집하는 헬퍼 클래스
 * 실시간 텍스트 출력과 성능 측정을 담당합니다
 */
class StreamingConsole {
  constructor() {
    this.currentLine = '';    // 현재 라인에 출력된 텍스트
    this.wordCount = 0;       // 총 단어 수 카운터
    this.startTime = null;    // 스트리밍 시작 시간
  }
  
  /**
   * 텍스트를 콘솔에 출력하고 통계를 업데이트합니다
   * @param {string} text - 출력할 텍스트
   */
  write(text) {
    process.stdout.write(text);  // 줄바꿈 없이 텍스트 출력
    this.currentLine += text;    // 현재 라인에 텍스트 추가
    
    // 단어 수 계산 (공백으로 구분된 단어들)
    const words = text.split(/\s+/).filter(w => w.length > 0);
    this.wordCount += words.length;
  }
  
  /**
   * 새로운 줄로 이동합니다
   */
  newLine() {
    process.stdout.write('\n');  // 줄바꿈 출력
    this.currentLine = '';       // 현재 라인 초기화
  }
  
  /**
   * 타이머를 시작하고 통계를 초기화합니다
   */
  startTimer() {
    this.startTime = Date.now();  // 현재 시간을 시작 시간으로 설정
    this.wordCount = 0;           // 단어 수 초기화
  }
  
  /**
   * 스트리밍 통계 정보를 반환합니다
   * @returns {Object} - 지속 시간, 단어 수, 초당 단어 수
   */
  getStats() {
    const duration = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;  // 초 단위로 변환
    const wordsPerSecond = duration > 0 ? (this.wordCount / duration).toFixed(1) : 0;  // 초당 단어 수 계산
    
    return {
      duration: duration.toFixed(2),    // 소수점 2자리까지 표시
      wordCount: this.wordCount,        // 총 단어 수
      wordsPerSecond                    // 초당 단어 수
    };
  }
}

// ===== 기본 스트리밍 예제 =====

/**
 * 가장 기본적인 스트리밍 예제
 * AI가 응답을 생성하는 동안 실시간으로 텍스트를 받아 출력합니다
 */
async function basicStreaming() {
  console.log('\n=== 기본 스트리밍 예제 ===');
  console.log('질문: 인공지능의 역사를 간단히 설명해주세요.\n');
  
  // 스트리밍 콘솔 헬퍼 인스턴스 생성
  const console = new StreamingConsole();
  console.startTimer();  // 타이머 시작
  
  try {
    // OpenAI API에 스트리밍 요청을 보냅니다
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',        // 사용할 AI 모델
      messages: [
        {
          role: 'user',               // 사용자 역할
          content: '인공지능의 역사를 간단히 설명해주세요. 주요 이정표를 중심으로 설명해주세요.'
        }
      ],
      stream: true,                   // 스트리밍 모드 활성화 (중요!)
      max_tokens: 500,                // 최대 토큰 수 제한
      temperature: 0.7,               // 창의성 조절
    });
    
    // AI 응답 시작을 알리는 프롬프트 출력
    process.stdout.write('AI: ');
    
    // for await...of 루프를 사용하여 스트림에서 데이터를 실시간으로 받습니다
    // 각 chunk는 AI가 생성한 텍스트의 일부분입니다
    for await (const chunk of stream) {
      // chunk.choices[0]?.delta?.content에서 실제 텍스트 내용을 추출
      // 옵셔널 체이닝(?.)을 사용하여 안전하게 접근
      const content = chunk.choices[0]?.delta?.content || '';
      
      // 추출된 텍스트를 실시간으로 출력합니다
      console.write(content);
    }
    
    // 스트리밍 완료 후 줄바꿈
    console.newLine();
    
    // 스트리밍 통계 정보를 출력합니다
    const stats = console.getStats();
    console.log(`\n통계: ${stats.duration}초, ${stats.wordCount}단어, ${stats.wordsPerSecond}단어/초`);
    
  } catch (error) {
    // 오류가 발생했을 때 처리
    console.error('\n오류 발생:', error.message);
  }
}

// ===== 프로그레스 인디케이터가 있는 스트리밍 =====

/**
 * 프로그레스 표시와 함께 스트리밍을 수행하는 예제
 * 긴 텍스트 생성 시 사용자에게 진행 상황을 보여줍니다
 */
async function streamingWithProgress() {
  console.log('\n=== 프로그레스 표시가 있는 스트리밍 ===');
  console.log('긴 텍스트 생성 중...\n');
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',             // 시스템 역할: AI의 성격 설정
          content: '당신은 이야기 작가입니다.'
        },
        {
          role: 'user',
          content: '미래 도시에 대한 짧은 SF 이야기를 써주세요. 3단락으로 구성해주세요.'
        }
      ],
      stream: true,
      max_tokens: 800,                // 더 긴 텍스트를 위해 토큰 수 증가
      temperature: 0.8,               // 창의적인 이야기를 위해 temperature 증가
    });
    
    // 스트리밍 진행 상황을 추적하는 변수들
    let fullText = '';                // 전체 생성된 텍스트
    let chunkCount = 0;               // 받은 청크 수
    
    // 로딩 스피너 애니메이션 (회전하는 문자들)
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    
    // 프로그레스 표시 시작
    process.stdout.write('생성 중 ');
    
    // 스트림에서 데이터를 받아 처리합니다
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullText += content;            // 전체 텍스트에 추가
      chunkCount++;                   // 청크 카운터 증가
      
      // 실시간 프로그레스 표시 (같은 줄에서 업데이트)
      // \r: 캐리지 리턴 (줄의 시작으로 이동)
      // spinner[chunkCount % spinner.length]: 순환하는 스피너 문자
      process.stdout.write(`\r생성 중 ${spinner[chunkCount % spinner.length]} (${fullText.length}자)`);
    }
    
    // 프로그레스 라인을 지우고 완료 메시지 출력
    process.stdout.write('\r' + ' '.repeat(50) + '\r');  // 50개의 공백으로 라인 지우기
    console.log('=== 생성 완료 ===\n');
    
    // 최종 결과 출력
    console.log(fullText);
    console.log(`\n총 ${chunkCount}개 청크, ${fullText.length}자 생성됨`);
    
  } catch (error) {
    console.error('\n오류 발생:', error.message);
  }
}

// ===== 멀티턴 스트리밍 대화 =====

/**
 * 여러 번의 대화에서 스트리밍을 사용하는 예제
 * 대화 히스토리를 유지하면서 각 응답을 실시간으로 받습니다
 */
async function multiTurnStreaming() {
  console.log('\n=== 멀티턴 스트리밍 대화 ===');
  
  // 대화 히스토리를 저장하는 배열
  const conversation = [
    {
      role: 'system',                 // 시스템 역할: AI의 기본 설정
      content: '당신은 기술 전문가입니다. 단계별로 설명을 제공합니다.'
    }
  ];
  
  // 순차적으로 질문할 내용들
  const questions = [
    'REST API란 무엇인가요?',
    '그럼 GraphQL과는 어떤 차이가 있나요?',
    '실제 사용 예시를 들어주세요.'
  ];
  
  try {
    // 각 질문에 대해 순차적으로 처리합니다
    for (const question of questions) {
      console.log(`\n사용자: ${question}`);
      
      // 대화 히스토리에 사용자 질문 추가
      conversation.push({ role: 'user', content: question });
      
      // 스트리밍 요청 생성
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversation,       // 전체 대화 히스토리 전송
        stream: true,
        max_tokens: 300,              // 각 응답은 짧게 제한
        temperature: 0.7,
      });
      
      // AI 응답 시작 표시
      process.stdout.write('AI: ');
      let assistantResponse = '';     // AI 응답을 저장할 변수
      
      // 스트리밍으로 응답 받기
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(content);  // 실시간 출력
        assistantResponse += content;    // 전체 응답 저장
      }
      
      console.log('\n');  // 줄바꿈
      
      // 대화 히스토리에 AI 응답 추가 (다음 대화에서 컨텍스트 유지)
      conversation.push({ role: 'assistant', content: assistantResponse });
      
      // 다음 질문 전 0.5초 대기 (읽기 편하도록)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

// ===== 스트리밍 중단 예제 =====

/**
 * AbortController를 사용하여 스트리밍을 중단하는 예제
 * 사용자가 긴 응답을 기다리지 않고 중단할 수 있는 기능을 보여줍니다
 */
async function streamingWithCancellation() {
  console.log('\n=== 스트리밍 중단 예제 ===');
  console.log('5초 후 스트리밍을 중단합니다...\n');
  
  try {
    // AbortController 생성 (스트리밍 중단을 위한 컨트롤러)
    const controller = new AbortController();
    
    // 5초 후 자동으로 스트리밍 중단
    setTimeout(() => {
      controller.abort();  // 스트리밍 중단 신호 전송
      console.log('\n\n[스트리밍 중단됨]');
    }, 5000);
    
    // 스트리밍 요청 생성 (signal 옵션 추가)
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: '양자 컴퓨팅에 대해 자세히 설명해주세요. 역사, 원리, 현재 상황, 미래 전망을 모두 다뤄주세요.'
        }
      ],
      stream: true,
      max_tokens: 1000,               // 긴 응답을 위해 토큰 수 증가
    }, {
      signal: controller.signal       // AbortController의 signal 전달
    });
    
    // AI 응답 시작 표시
    process.stdout.write('AI: ');
    
    // 스트리밍 처리 (중단될 수 있음)
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
    }
    
  } catch (error) {
    // AbortError인지 확인하여 적절한 메시지 출력
    if (error.name === 'AbortError') {
      console.log('스트리밍이 사용자에 의해 중단되었습니다.');
    } else {
      console.error('오류 발생:', error.message);
    }
  }
}

// ===== JSON 모드 스트리밍 =====

/**
 * JSON 형식으로 응답을 받는 스트리밍 예제
 * 구조화된 데이터를 실시간으로 생성하고 파싱합니다
 */
async function streamingJsonMode() {
  console.log('\n=== JSON 스트리밍 예제 ===');
  console.log('구조화된 데이터를 스트리밍으로 생성합니다...\n');
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',    // JSON 모드를 지원하는 모델
      messages: [
        {
          role: 'system',
          content: 'JSON 형식으로만 응답하세요.'  // JSON 응답 강제
        },
        {
          role: 'user',
          content: '프로그래밍 언어 3개에 대한 정보를 JSON 배열로 만들어주세요. 각 언어는 name, year, creator, purpose 필드를 가져야 합니다.'
        }
      ],
      stream: true,
      response_format: { type: 'json_object' },  // JSON 응답 형식 지정
      max_tokens: 500,
    });
    
    // JSON 문자열을 누적할 변수
    let jsonString = '';
    process.stdout.write('생성 중: ');
    
    // JSON 스트리밍 처리
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      jsonString += content;          // JSON 문자열에 추가
      process.stdout.write(content);  // 실시간 출력
    }
    
    console.log('\n\n파싱된 JSON:');
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(jsonString);
      // 보기 좋게 들여쓰기하여 출력
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // JSON 파싱 실패 시 오류 메시지 출력
      console.log('JSON 파싱 실패:', e.message);
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

// ===== 메인 실행 함수 =====

/**
 * 사용자가 선택한 스트리밍 예제를 실행하는 메인 함수
 */
async function main() {
  console.log('=== 중급 예제 2: 스트리밍 응답 ===');
  
  // readline 인터페이스 설정 (사용자 입력 받기)
  const rl = readline.createInterface({
    input: process.stdin,   // 표준 입력
    output: process.stdout  // 표준 출력
  });
  
  // 사용자 입력을 받는 헬퍼 함수
  const askQuestion = (prompt) => new Promise(resolve => {
    rl.question(prompt, resolve);
  });
  
  // 실행 가능한 예제 목록 출력
  console.log('\n실행할 예제를 선택하세요:');
  console.log('1. 기본 스트리밍');
  console.log('2. 프로그레스 표시');
  console.log('3. 멀티턴 대화');
  console.log('4. 스트리밍 중단');
  console.log('5. JSON 스트리밍');
  console.log('6. 모든 예제 실행');
  
  // 사용자 선택 받기
  const choice = await askQuestion('\n선택 (1-6): ');
  
  // 선택에 따라 해당 예제 실행
  switch(choice) {
    case '1':
      await basicStreaming();
      break;
    case '2':
      await streamingWithProgress();
      break;
    case '3':
      await multiTurnStreaming();
      break;
    case '4':
      await streamingWithCancellation();
      break;
    case '5':
      await streamingJsonMode();
      break;
    case '6':
      // 모든 예제를 순차적으로 실행 (중단 예제는 시간이 걸려서 생략)
      await basicStreaming();
      await streamingWithProgress();
      await multiTurnStreaming();
      // await streamingWithCancellation();  // 5초 대기가 필요하므로 주석 처리
      await streamingJsonMode();
      break;
    default:
      console.log('잘못된 선택입니다.');
  }
  
  // readline 인터페이스 종료
  rl.close();
}

// ===== 프로그램 시작 =====

// 메인 함수를 실행하고 오류가 발생하면 콘솔에 출력합니다
// .catch(console.error)는 Promise에서 발생한 오류를 처리하는 방법입니다
main().catch(console.error);
