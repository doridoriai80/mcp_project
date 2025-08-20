/**
 * 중급 예제 1: 함수 호출 (Function Calling)
 * OpenAI의 Function Calling 기능을 사용하여 구조화된 데이터를 처리합니다.
 * 
 * 이 예제에서는 다음을 학습합니다:
 * 1. Function Calling의 개념과 장점
 * 2. 함수 스키마 정의 방법 (JSON Schema)
 * 3. 2단계 API 호출 프로세스 (함수 결정 → 함수 실행 → 결과 처리)
 * 4. 구조화된 데이터 처리 (날씨, 할 일, 계산기)
 * 5. 안전한 함수 실행과 오류 처리
 * 6. 병렬 함수 호출 시나리오
 * 
 * Function Calling이란?
 * - AI가 사용자 요청을 분석하여 적절한 함수를 자동으로 호출하는 기능
 * - 구조화된 데이터를 안전하게 처리할 수 있음
 * - 외부 API나 데이터베이스와의 연동이 가능
 */

// OpenAI 라이브러리 - AI 모델과 대화하기 위한 도구
import OpenAI from 'openai';
// 환경 변수 관리 - API 키 등을 안전하게 저장
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

// ===== 가상 데이터베이스 (실제로는 외부 API나 DB를 사용) =====

// 가상의 날씨 데이터베이스
// 실제 프로젝트에서는 OpenWeatherMap API 등을 사용합니다
const weatherData = {
  '서울': { temp: 15, condition: '맑음', humidity: 45 },
  '부산': { temp: 18, condition: '흐림', humidity: 65 },
  '제주': { temp: 20, condition: '비', humidity: 80 },
  '대구': { temp: 17, condition: '구름조금', humidity: 50 },
};

// 가상의 할 일 목록 (메모리에 저장)
// 실제 프로젝트에서는 데이터베이스나 파일 시스템을 사용합니다
const todoList = [];

// ===== 실제 실행될 함수들 =====

/**
 * 날씨 정보를 가져오는 함수
 * @param {string} location - 도시 이름
 * @returns {string} - JSON 형태의 날씨 정보
 */
function getWeather(location) {
  // 데이터베이스에서 해당 도시의 날씨 정보를 찾습니다
  const weather = weatherData[location];
  
  if (weather) {
    // 날씨 정보가 있으면 구조화된 JSON 형태로 반환
    return JSON.stringify({
      location,                    // 도시 이름
      temperature: weather.temp,   // 온도
      condition: weather.condition, // 날씨 상태
      humidity: weather.humidity,   // 습도
      unit: 'celsius'              // 온도 단위
    });
  }
  
  // 날씨 정보가 없으면 오류 메시지 반환
  return JSON.stringify({ error: `${location}의 날씨 정보를 찾을 수 없습니다.` });
}

/**
 * 할 일 목록에 새로운 작업을 추가하는 함수
 * @param {string} task - 작업 내용
 * @param {string} priority - 우선순위 (low, medium, high)
 * @returns {string} - JSON 형태의 추가 결과
 */
function addTodo(task, priority = 'medium') {
  // 새로운 할 일 객체를 생성합니다
  const todo = {
    id: todoList.length + 1,           // 고유 ID (순차적으로 증가)
    task,                              // 작업 내용
    priority,                          // 우선순위
    completed: false,                  // 완료 여부 (기본값: false)
    createdAt: new Date().toISOString() // 생성 시간 (ISO 형식)
  };
  
  // 할 일 목록에 추가합니다
  todoList.push(todo);
  
  // 성공 결과를 JSON 형태로 반환합니다
  return JSON.stringify({ success: true, todo });
}

/**
 * 현재 할 일 목록을 가져오는 함수
 * @returns {string} - JSON 형태의 할 일 목록
 */
function getTodos() {
  // 전체 할 일 목록을 JSON 형태로 반환합니다
  return JSON.stringify(todoList);
}

/**
 * 간단한 수학 계산을 수행하는 함수
 * @param {string} expression - 계산할 수식 (예: "2+2", "10*5")
 * @returns {string} - JSON 형태의 계산 결과
 */
function calculate(expression) {
  try {
    // 보안을 위해 위험한 문자들을 제거합니다
    // 숫자, 기본 연산자(+,-,*,/), 괄호, 공백만 허용
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    // Function 생성자를 사용하여 수식을 안전하게 평가합니다
    // "use strict" 모드로 추가 보안을 제공합니다
    const result = Function('"use strict"; return (' + sanitized + ')')();
    
    // 계산 결과를 JSON 형태로 반환합니다
    return JSON.stringify({ expression, result });
    
  } catch (error) {
    // 계산 중 오류가 발생하면 오류 메시지를 반환합니다
    return JSON.stringify({ error: '계산할 수 없는 수식입니다.' });
  }
}

// ===== OpenAI 함수 스키마 정의 (JSON Schema) =====

// AI가 어떤 함수를 호출할지 결정하기 위한 함수 정의들
// 각 함수의 이름, 설명, 매개변수 타입을 명시합니다
const functions = [
  {
    name: 'getWeather',  // 함수 이름 (AI가 호출할 때 사용)
    description: '특정 도시의 현재 날씨 정보를 가져옵니다',  // AI가 이해할 수 있는 설명
    parameters: {
      type: 'object',    // 매개변수는 객체 형태
      properties: {      // 객체의 속성들 정의
        location: {
          type: 'string',  // 문자열 타입
          description: '날씨를 확인할 도시 이름 (예: 서울, 부산, 제주)',  // 매개변수 설명
        },
      },
      required: ['location'],  // 필수 매개변수 목록
    },
  },
  {
    name: 'addTodo',
    description: '할 일 목록에 새로운 작업을 추가합니다',
    parameters: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: '추가할 작업 내용',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],  // 허용되는 값들을 제한
          description: '작업의 우선순위',
        },
      },
      required: ['task'],  // priority는 선택사항 (기본값 있음)
    },
  },
  {
    name: 'getTodos',
    description: '현재 할 일 목록을 가져옵니다',
    parameters: {
      type: 'object',
      properties: {},  // 매개변수가 없는 함수
    },
  },
  {
    name: 'calculate',
    description: '수학 계산을 수행합니다',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: '계산할 수식 (예: 2+2, 10*5, (8+2)/2)',
        },
      },
      required: ['expression'],
    },
  },
];

// ===== 함수 실행 매핑 =====

// 함수 이름과 실제 함수를 연결하는 객체
// AI가 함수 이름을 결정하면 이 객체에서 실제 함수를 찾아 실행합니다
const availableFunctions = {
  getWeather,   // 'getWeather' 이름으로 getWeather 함수 실행
  addTodo,      // 'addTodo' 이름으로 addTodo 함수 실행
  getTodos,     // 'getTodos' 이름으로 getTodos 함수 실행
  calculate,    // 'calculate' 이름으로 calculate 함수 실행
};

// ===== Function Calling 실행 로직 =====

/**
 * Function Calling 예제를 실행하는 메인 함수
 * @param {string} userMessage - 사용자가 입력한 메시지
 */
async function runFunctionCalling(userMessage) {
  console.log(`\n사용자: ${userMessage}`);
  
  try {
    // ===== 1단계: AI에게 함수 호출 여부 결정 요청 =====
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',        // 사용할 AI 모델
      messages: [
        {
          role: 'system',             // 시스템 역할: AI의 기본 설정
          content: '당신은 도움이 되는 어시스턴트입니다. 사용자의 요청에 따라 적절한 함수를 호출하여 작업을 수행합니다.'
        },
        {
          role: 'user',               // 사용자 역할: 실제 질문
          content: userMessage
        }
      ],
      functions: functions,           // 사용 가능한 함수들의 정의
      function_call: 'auto',          // AI가 자동으로 함수 호출 여부를 결정
    });
    
    // AI의 응답을 가져옵니다
    const responseMessage = response.choices[0].message;
    
    // ===== 2단계: 함수 호출이 필요한 경우 처리 =====
    if (responseMessage.function_call) {
      // AI가 함수 호출을 결정한 경우
      
      // 함수 이름과 매개변수를 추출합니다
      const functionName = responseMessage.function_call.name;  // 호출할 함수 이름
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);  // 매개변수 (JSON 문자열을 객체로 변환)
      
      console.log(`\n함수 호출: ${functionName}`);
      console.log('인자:', functionArgs);
      
      // 실제 함수를 실행합니다
      const functionToCall = availableFunctions[functionName];  // 함수 이름으로 실제 함수 찾기
      const functionResponse = functionToCall(...Object.values(functionArgs));  // 매개변수를 전달하여 함수 실행
      
      console.log('함수 결과:', functionResponse);
      
      // ===== 3단계: 함수 실행 결과를 AI에게 전달하여 최종 응답 생성 =====
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 도움이 되는 어시스턴트입니다.'
          },
          {
            role: 'user',
            content: userMessage  // 원래 사용자 질문
          },
          responseMessage,        // AI의 함수 호출 결정
          {
            role: 'function',     // 함수 실행 결과를 AI에게 전달
            name: functionName,   // 실행된 함수 이름
            content: functionResponse,  // 함수 실행 결과
          },
        ],
      });
      
      // 최종 AI 응답을 출력합니다
      console.log('\nAI:', secondResponse.choices[0].message.content);
      
    } else {
      // 함수 호출이 필요 없는 경우 (일반적인 대화)
      console.log('\nAI:', responseMessage.content);
    }
    
  } catch (error) {
    // 오류가 발생했을 때 처리
    console.error('오류 발생:', error.message);
  }
}

// ===== 병렬 함수 호출 예제 =====

/**
 * 여러 함수를 동시에 호출하는 예제 (고급 기능)
 * 실제로는 GPT-4에서 더 잘 작동합니다
 */
async function runParallelFunctionCalling() {
  console.log('\n=== 병렬 함수 호출 예제 ===');
  
  // 여러 작업을 한 번에 요청하는 예시
  const userMessage = '서울과 부산의 날씨를 알려주고, 우산 챙기기를 할 일 목록에 높은 우선순위로 추가해줘';
  console.log(`사용자: ${userMessage}`);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 도움이 되는 어시스턴트입니다. 여러 작업을 동시에 처리할 수 있습니다.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      functions: functions,
      function_call: 'auto',
    });
    
    const message = response.choices[0].message;
    
    // 여러 함수 호출 처리 (GPT-4에서 더 잘 작동)
    if (message.function_call) {
      console.log('\n감지된 함수 호출:', message.function_call.name);
      // 실제로는 여러 함수를 순차적으로 호출해야 할 수 있음
      // GPT-3.5는 한 번에 하나의 함수만 호출할 수 있습니다
    }
    
  } catch (error) {
    console.error('오류:', error.message);
  }
}

// ===== 메인 실행 함수 =====

/**
 * 전체 예제를 실행하는 메인 함수
 */
async function main() {
  console.log('=== 중급 예제 1: Function Calling ===\n');
  
  // 다양한 함수 호출 예제들을 배열로 정의합니다
  const examples = [
    '서울의 날씨는 어때?',                                    // getWeather 함수 호출
    '2 + 2는 뭐야?',                                         // calculate 함수 호출
    '장보기를 할 일 목록에 추가해줘',                          // addTodo 함수 호출
    '현재 할 일 목록을 보여줘',                               // getTodos 함수 호출
    '(10 + 5) * 3을 계산해줘',                               // calculate 함수 호출
    '제주도 날씨가 어떤지 알려주고, 만약 비가 온다면 우산 챙기기를 할 일에 추가해줘',  // 복합 요청
  ];
  
  // 각 예제를 순차적으로 실행합니다
  for (const example of examples) {
    await runFunctionCalling(example);
    console.log('\n---');
    
    // API 호출 간 1초 대기 (속도 제한 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 병렬 함수 호출 예제 (선택적 - 주석 해제하여 실행 가능)
  // await runParallelFunctionCalling();
  
  // ===== 최종 결과 출력 =====
  console.log('\n=== 최종 할 일 목록 ===');
  console.log(JSON.stringify(todoList, null, 2));  // 보기 좋게 들여쓰기하여 출력
}

// ===== 프로그램 시작 =====

// 메인 함수를 실행하고 오류가 발생하면 콘솔에 출력합니다
// .catch(console.error)는 Promise에서 발생한 오류를 처리하는 방법입니다
main().catch(console.error);
