/**
 * 초급 예제 1: 간단한 텍스트 생성
 * OpenAI API를 사용하여 기본적인 텍스트 생성을 수행합니다.
 * 
 * 이 예제에서는 다음을 학습합니다:
 * 1. OpenAI API 클라이언트 설정
 * 2. 기본적인 텍스트 생성 요청
 * 3. Temperature 파라미터의 영향
 * 4. 다양한 스타일로 텍스트 변환
 * 5. API 사용량(토큰) 확인
 */

// OpenAI 라이브러리 가져오기 - AI 모델과 대화하기 위한 도구
import OpenAI from 'openai';
// 환경 변수를 .env 파일에서 읽어오기 위한 라이브러리
import dotenv from 'dotenv';
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

/**
 * 메인 함수: OpenAI API를 사용하여 다양한 텍스트 생성 예제를 실행합니다
 */
async function generateText() {
  console.log('=== 초급 예제 1: 간단한 텍스트 생성 ===\n');
  
  try {
    // ===== 1단계: 기본적인 텍스트 생성 =====
    console.log('1. 이야기 시작 문장 생성:');
    
    // OpenAI API에 텍스트 생성 요청을 보냅니다
    const completion1 = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',        // 사용할 AI 모델 (GPT-3.5 Turbo는 빠르고 비용 효율적)
      messages: [                     // AI와의 대화 내용을 담는 배열
        {
          role: 'system',             // 시스템 역할: AI의 성격과 행동을 정의
          content: '당신은 창의적인 이야기 작가입니다.'  // AI에게 부여할 역할
        },
        {
          role: 'user',               // 사용자 역할: 실제 질문이나 요청
          content: '흥미로운 판타지 이야기의 시작 문장을 하나 만들어주세요.'  // 구체적인 요청
        }
      ],
      max_tokens: 100,                // AI가 생성할 수 있는 최대 토큰 수 (1 토큰 ≈ 2-3 한글 글자)
      temperature: 0.8,               // 창의성 조절 (0: 결정적/일관적, 1: 창의적/다양함, 0.8: 적당히 창의적)
    });
    
    // AI가 생성한 응답을 콘솔에 출력합니다
    console.log('생성된 문장:', completion1.choices[0].message.content);
    console.log('\n---\n');
    
    // ===== 2단계: Temperature 파라미터의 영향 확인 =====
    console.log('2. 온도(Temperature) 설정에 따른 차이:');
    const prompt = '인공지능의 미래는';  // 완성할 문장의 시작 부분
    
    // 서로 다른 temperature 값으로 같은 프롬프트를 여러 번 요청하여 차이를 확인합니다
    for (const temp of [0.2, 0.5, 0.9]) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `다음 문장을 완성해주세요: "${prompt}"`  // 템플릿 리터럴을 사용하여 동적으로 프롬프트 구성
          }
        ],
        max_tokens: 50,               // 짧은 응답을 위해 토큰 수 제한
        temperature: temp,             // 반복문에서 현재 temperature 값 사용
      });
      
      // 각 temperature 값에 따른 응답을 출력하여 차이를 비교할 수 있게 합니다
      console.log(`Temperature ${temp}:`, completion.choices[0].message.content);
    }
    console.log('\n---\n');
    
    // ===== 3단계: 다양한 스타일로 텍스트 변환 =====
    console.log('3. 다양한 스타일로 같은 내용 표현:');
    const content = '오늘 날씨가 매우 좋습니다';  // 변환할 원본 텍스트
    const styles = ['시적으로', '과학적으로', '유머러스하게'];  // 적용할 스타일들
    
    // 각 스타일에 대해 같은 내용을 다르게 표현하도록 요청합니다
    for (const style of styles) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `"${content}"를 ${style} 다시 표현해주세요.`  // 동적으로 스타일을 지정
          }
        ],
        max_tokens: 100,              // 충분한 길이로 스타일을 표현할 수 있도록 설정
      });
      
      // 각 스타일별 결과를 출력합니다
      console.log(`${style}:`, completion.choices[0].message.content);
    }
    
    // ===== 4단계: API 사용량 및 비용 정보 확인 =====
    console.log('\n---\n');
    console.log('4. API 사용량 정보:');
    
    // 첫 번째 요청에서 반환된 사용량 정보를 가져옵니다
    const usage = completion1.usage;
    
    // 각종 토큰 사용량을 출력합니다 (비용 계산에 중요)
    console.log(`- 입력 토큰: ${usage.prompt_tokens}`);      // 사용자가 보낸 메시지의 토큰 수
    console.log(`- 출력 토큰: ${usage.completion_tokens}`);  // AI가 생성한 응답의 토큰 수
    console.log(`- 총 토큰: ${usage.total_tokens}`);         // 전체 사용된 토큰 수 (입력 + 출력)
    
    // 참고: OpenAI 요금은 토큰 수에 따라 계산됩니다
    // GPT-3.5-turbo: 입력 $0.001/1K 토큰, 출력 $0.002/1K 토큰
    
  } catch (error) {
    // 오류가 발생했을 때 처리하는 부분
    console.error('오류 발생:', error.message);
    
    // API 응답 오류인 경우 추가 정보를 출력합니다
    if (error.response) {
      console.error('상태 코드:', error.response.status);    // HTTP 상태 코드 (예: 401, 429, 500)
      console.error('오류 내용:', error.response.data);      // 서버에서 반환한 오류 상세 정보
    }
  }
}

// ===== 프로그램 시작 =====
console.log('OpenAI API를 사용한 텍스트 생성 예제\n');

// 메인 함수를 실행합니다
// .catch(console.error)는 오류가 발생했을 때 콘솔에 출력하도록 합니다
generateText();
