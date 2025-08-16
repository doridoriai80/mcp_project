/**
 * 중급 예제 1: 함수 호출 (Function Calling)
 * OpenAI의 Function Calling 기능을 사용하여 구조화된 데이터를 처리합니다.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
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

// 가상의 날씨 데이터베이스
const weatherData = {
  '서울': { temp: 15, condition: '맑음', humidity: 45 },
  '부산': { temp: 18, condition: '흐림', humidity: 65 },
  '제주': { temp: 20, condition: '비', humidity: 80 },
  '대구': { temp: 17, condition: '구름조금', humidity: 50 },
};

// 가상의 할 일 목록
const todoList = [];

// 함수 정의: 날씨 정보 가져오기
function getWeather(location) {
  const weather = weatherData[location];
  if (weather) {
    return JSON.stringify({
      location,
      temperature: weather.temp,
      condition: weather.condition,
      humidity: weather.humidity,
      unit: 'celsius'
    });
  }
  return JSON.stringify({ error: `${location}의 날씨 정보를 찾을 수 없습니다.` });
}

// 함수 정의: 할 일 추가
function addTodo(task, priority = 'medium') {
  const todo = {
    id: todoList.length + 1,
    task,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todoList.push(todo);
  return JSON.stringify({ success: true, todo });
}

// 함수 정의: 할 일 목록 가져오기
function getTodos() {
  return JSON.stringify(todoList);
}

// 함수 정의: 간단한 계산기
function calculate(expression) {
  try {
    // 안전한 수식 평가 (기본 연산만 허용)
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    const result = Function('"use strict"; return (' + sanitized + ')')();
    return JSON.stringify({ expression, result });
  } catch (error) {
    return JSON.stringify({ error: '계산할 수 없는 수식입니다.' });
  }
}

// OpenAI 함수 스키마 정의
const functions = [
  {
    name: 'getWeather',
    description: '특정 도시의 현재 날씨 정보를 가져옵니다',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: '날씨를 확인할 도시 이름 (예: 서울, 부산, 제주)',
        },
      },
      required: ['location'],
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
          enum: ['low', 'medium', 'high'],
          description: '작업의 우선순위',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'getTodos',
    description: '현재 할 일 목록을 가져옵니다',
    parameters: {
      type: 'object',
      properties: {},
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

// 함수 실행 매핑
const availableFunctions = {
  getWeather,
  addTodo,
  getTodos,
  calculate,
};

// Function Calling 예제 실행
async function runFunctionCalling(userMessage) {
  console.log(`\n사용자: ${userMessage}`);
  
  try {
    // 1단계: OpenAI에 메시지와 함수 정의 전송
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 도움이 되는 어시스턴트입니다. 사용자의 요청에 따라 적절한 함수를 호출하여 작업을 수행합니다.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      functions: functions,
      function_call: 'auto', // 자동으로 함수 호출 결정
    });
    
    const responseMessage = response.choices[0].message;
    
    // 2단계: 함수 호출이 필요한 경우 처리
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      
      console.log(`\n함수 호출: ${functionName}`);
      console.log('인자:', functionArgs);
      
      // 함수 실행
      const functionToCall = availableFunctions[functionName];
      const functionResponse = functionToCall(...Object.values(functionArgs));
      
      console.log('함수 결과:', functionResponse);
      
      // 3단계: 함수 실행 결과를 포함하여 다시 OpenAI에 전송
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 도움이 되는 어시스턴트입니다.'
          },
          {
            role: 'user',
            content: userMessage
          },
          responseMessage,
          {
            role: 'function',
            name: functionName,
            content: functionResponse,
          },
        ],
      });
      
      console.log('\nAI:', secondResponse.choices[0].message.content);
    } else {
      // 함수 호출이 필요 없는 경우
      console.log('\nAI:', responseMessage.content);
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

// 병렬 함수 호출 예제
async function runParallelFunctionCalling() {
  console.log('\n=== 병렬 함수 호출 예제 ===');
  
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
    }
    
  } catch (error) {
    console.error('오류:', error.message);
  }
}

// 메인 실행 함수
async function main() {
  console.log('=== 중급 예제 1: Function Calling ===\n');
  
  // 다양한 함수 호출 예제
  const examples = [
    '서울의 날씨는 어때?',
    '2 + 2는 뭐야?',
    '장보기를 할 일 목록에 추가해줘',
    '현재 할 일 목록을 보여줘',
    '(10 + 5) * 3을 계산해줘',
    '제주도 날씨가 어떤지 알려주고, 만약 비가 온다면 우산 챙기기를 할 일에 추가해줘',
  ];
  
  for (const example of examples) {
    await runFunctionCalling(example);
    console.log('\n---');
    
    // API 호출 간 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 병렬 함수 호출 예제 (선택적)
  // await runParallelFunctionCalling();
  
  console.log('\n=== 최종 할 일 목록 ===');
  console.log(JSON.stringify(todoList, null, 2));
}

// 프로그램 실행
main().catch(console.error);
