/**
 * 초급 예제 1: 간단한 텍스트 생성
 * OpenAI API를 사용하여 기본적인 텍스트 생성을 수행합니다.
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

async function generateText() {
  console.log('=== 초급 예제 1: 간단한 텍스트 생성 ===\n');
  
  try {
    // 1. 간단한 완성 요청
    console.log('1. 이야기 시작 문장 생성:');
    const completion1 = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 창의적인 이야기 작가입니다.'
        },
        {
          role: 'user',
          content: '흥미로운 판타지 이야기의 시작 문장을 하나 만들어주세요.'
        }
      ],
      max_tokens: 100,
      temperature: 0.8, // 창의성 조절 (0~1)
    });
    
    console.log('생성된 문장:', completion1.choices[0].message.content);
    console.log('\n---\n');
    
    // 2. 다양한 온도 설정으로 텍스트 생성
    console.log('2. 온도(Temperature) 설정에 따른 차이:');
    const prompt = '인공지능의 미래는';
    
    for (const temp of [0.2, 0.5, 0.9]) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `다음 문장을 완성해주세요: "${prompt}"`
          }
        ],
        max_tokens: 50,
        temperature: temp,
      });
      
      console.log(`Temperature ${temp}:`, completion.choices[0].message.content);
    }
    console.log('\n---\n');
    
    // 3. 특정 스타일로 텍스트 생성
    console.log('3. 다양한 스타일로 같은 내용 표현:');
    const content = '오늘 날씨가 매우 좋습니다';
    const styles = ['시적으로', '과학적으로', '유머러스하게'];
    
    for (const style of styles) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `"${content}"를 ${style} 다시 표현해주세요.`
          }
        ],
        max_tokens: 100,
      });
      
      console.log(`${style}:`, completion.choices[0].message.content);
    }
    
    // 4. 토큰 사용량 확인
    console.log('\n---\n');
    console.log('4. API 사용량 정보:');
    const usage = completion1.usage;
    console.log(`- 입력 토큰: ${usage.prompt_tokens}`);
    console.log(`- 출력 토큰: ${usage.completion_tokens}`);
    console.log(`- 총 토큰: ${usage.total_tokens}`);
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('오류 내용:', error.response.data);
    }
  }
}

// 실행
console.log('OpenAI API를 사용한 텍스트 생성 예제\n');
generateText();
