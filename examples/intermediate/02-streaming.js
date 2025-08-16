/**
 * 중급 예제 2: 스트리밍 응답
 * OpenAI API의 스트리밍 기능을 사용하여 실시간으로 응답을 받습니다.
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

// 콘솔 출력 헬퍼
class StreamingConsole {
  constructor() {
    this.currentLine = '';
    this.wordCount = 0;
    this.startTime = null;
  }
  
  write(text) {
    process.stdout.write(text);
    this.currentLine += text;
    
    // 단어 수 계산
    const words = text.split(/\s+/).filter(w => w.length > 0);
    this.wordCount += words.length;
  }
  
  newLine() {
    process.stdout.write('\n');
    this.currentLine = '';
  }
  
  startTimer() {
    this.startTime = Date.now();
    this.wordCount = 0;
  }
  
  getStats() {
    const duration = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const wordsPerSecond = duration > 0 ? (this.wordCount / duration).toFixed(1) : 0;
    return {
      duration: duration.toFixed(2),
      wordCount: this.wordCount,
      wordsPerSecond
    };
  }
}

// 기본 스트리밍 예제
async function basicStreaming() {
  console.log('\n=== 기본 스트리밍 예제 ===');
  console.log('질문: 인공지능의 역사를 간단히 설명해주세요.\n');
  
  const console = new StreamingConsole();
  console.startTimer();
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: '인공지능의 역사를 간단히 설명해주세요. 주요 이정표를 중심으로 설명해주세요.'
        }
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    process.stdout.write('AI: ');
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      console.write(content);
    }
    
    console.newLine();
    
    const stats = console.getStats();
    console.log(`\n통계: ${stats.duration}초, ${stats.wordCount}단어, ${stats.wordsPerSecond}단어/초`);
    
  } catch (error) {
    console.error('\n오류 발생:', error.message);
  }
}

// 스트리밍 with 프로그레스 인디케이터
async function streamingWithProgress() {
  console.log('\n=== 프로그레스 표시가 있는 스트리밍 ===');
  console.log('긴 텍스트 생성 중...\n');
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 이야기 작가입니다.'
        },
        {
          role: 'user',
          content: '미래 도시에 대한 짧은 SF 이야기를 써주세요. 3단락으로 구성해주세요.'
        }
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.8,
    });
    
    let fullText = '';
    let chunkCount = 0;
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    
    process.stdout.write('생성 중 ');
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullText += content;
      chunkCount++;
      
      // 프로그레스 표시
      process.stdout.write(`\r생성 중 ${spinner[chunkCount % spinner.length]} (${fullText.length}자)`);
    }
    
    // 완료 후 전체 텍스트 출력
    process.stdout.write('\r' + ' '.repeat(50) + '\r'); // 프로그레스 라인 지우기
    console.log('=== 생성 완료 ===\n');
    console.log(fullText);
    console.log(`\n총 ${chunkCount}개 청크, ${fullText.length}자 생성됨`);
    
  } catch (error) {
    console.error('\n오류 발생:', error.message);
  }
}

// 멀티턴 스트리밍 대화
async function multiTurnStreaming() {
  console.log('\n=== 멀티턴 스트리밍 대화 ===');
  
  const conversation = [
    {
      role: 'system',
      content: '당신은 기술 전문가입니다. 단계별로 설명을 제공합니다.'
    }
  ];
  
  const questions = [
    'REST API란 무엇인가요?',
    '그럼 GraphQL과는 어떤 차이가 있나요?',
    '실제 사용 예시를 들어주세요.'
  ];
  
  try {
    for (const question of questions) {
      console.log(`\n사용자: ${question}`);
      conversation.push({ role: 'user', content: question });
      
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversation,
        stream: true,
        max_tokens: 300,
        temperature: 0.7,
      });
      
      process.stdout.write('AI: ');
      let assistantResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(content);
        assistantResponse += content;
      }
      
      console.log('\n');
      conversation.push({ role: 'assistant', content: assistantResponse });
      
      // 다음 질문 전 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

// 스트리밍 중단 시뮬레이션
async function streamingWithCancellation() {
  console.log('\n=== 스트리밍 중단 예제 ===');
  console.log('5초 후 스트리밍을 중단합니다...\n');
  
  try {
    const controller = new AbortController();
    
    // 5초 후 중단
    setTimeout(() => {
      controller.abort();
      console.log('\n\n[스트리밍 중단됨]');
    }, 5000);
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: '양자 컴퓨팅에 대해 자세히 설명해주세요. 역사, 원리, 현재 상황, 미래 전망을 모두 다뤄주세요.'
        }
      ],
      stream: true,
      max_tokens: 1000,
    }, {
      signal: controller.signal
    });
    
    process.stdout.write('AI: ');
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('스트리밍이 사용자에 의해 중단되었습니다.');
    } else {
      console.error('오류 발생:', error.message);
    }
  }
}

// 스트리밍 데이터 처리 (JSON 모드)
async function streamingJsonMode() {
  console.log('\n=== JSON 스트리밍 예제 ===');
  console.log('구조화된 데이터를 스트리밍으로 생성합니다...\n');
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106', // JSON 모드 지원 모델
      messages: [
        {
          role: 'system',
          content: 'JSON 형식으로만 응답하세요.'
        },
        {
          role: 'user',
          content: '프로그래밍 언어 3개에 대한 정보를 JSON 배열로 만들어주세요. 각 언어는 name, year, creator, purpose 필드를 가져야 합니다.'
        }
      ],
      stream: true,
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });
    
    let jsonString = '';
    process.stdout.write('생성 중: ');
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      jsonString += content;
      process.stdout.write(content);
    }
    
    console.log('\n\n파싱된 JSON:');
    try {
      const parsed = JSON.parse(jsonString);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('JSON 파싱 실패:', e.message);
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

// 메인 실행 함수
async function main() {
  console.log('=== 중급 예제 2: 스트리밍 응답 ===');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (prompt) => new Promise(resolve => {
    rl.question(prompt, resolve);
  });
  
  console.log('\n실행할 예제를 선택하세요:');
  console.log('1. 기본 스트리밍');
  console.log('2. 프로그레스 표시');
  console.log('3. 멀티턴 대화');
  console.log('4. 스트리밍 중단');
  console.log('5. JSON 스트리밍');
  console.log('6. 모든 예제 실행');
  
  const choice = await askQuestion('\n선택 (1-6): ');
  
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
      await basicStreaming();
      await streamingWithProgress();
      await multiTurnStreaming();
      // streamingWithCancellation은 시간이 걸리므로 생략
      await streamingJsonMode();
      break;
    default:
      console.log('잘못된 선택입니다.');
  }
  
  rl.close();
}

// 프로그램 실행
main().catch(console.error);
