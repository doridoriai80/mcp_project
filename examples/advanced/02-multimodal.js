/**
 * 고급 예제 2: 멀티모달 (이미지 + 텍스트) 처리
 * 
 * 이 파일은 GPT-4 Vision API와 DALL-E를 사용한 멀티모달 AI 시스템을 구현합니다.
 * 멀티모달 AI는 이미지와 텍스트를 함께 처리하여 더 풍부한 AI 경험을 제공합니다.
 * 
 * 주요 기능:
 * 1. 이미지 분석 및 설명 (GPT-4 Vision)
 * 2. 이미지 비교 분석
 * 3. 이미지 기반 질의응답
 * 4. 이미지 생성 (DALL-E)
 * 5. 실용적 사용 사례 (OCR, 접근성, 데이터 추출)
 * 
 * 사용 기술:
 * - GPT-4 Vision API: 이미지 이해 및 분석
 * - DALL-E API: 이미지 생성 및 변형
 * - Base64 인코딩: 이미지 데이터 전송
 * - SVG 생성: 샘플 이미지 생성
 * - Axios: 이미지 다운로드
 */

// 필요한 라이브러리들을 가져옵니다
import OpenAI from 'openai';        // OpenAI API 클라이언트
import dotenv from 'dotenv';        // 환경변수 관리
import fs from 'fs/promises';       // 파일 시스템 작업 (비동기)
import axios from 'axios';          // HTTP 요청 (이미지 다운로드용)
import { fileURLToPath } from 'url'; // ES modules에서 __dirname 사용을 위한 유틸리티
import { dirname, join } from 'path'; // 경로 조작 유틸리티

// ES modules에서는 __dirname이 기본적으로 제공되지 않으므로 직접 생성
const __filename = fileURLToPath(import.meta.url);  // 현재 파일의 절대 경로
const __dirname = dirname(__filename);              // 현재 파일이 있는 디렉토리 경로

// .env 파일에서 환경변수를 로드합니다 (OpenAI API 키 등)
dotenv.config({ path: join(__dirname, '../../.env') });

// OpenAI 클라이언트를 초기화합니다
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 환경변수에서 API 키를 가져옴
});

/**
 * 이미지 유틸리티 클래스
 * 
 * 이미지 처리와 관련된 다양한 유틸리티 함수들을 제공합니다.
 * - 이미지 인코딩 (Base64)
 * - 이미지 다운로드
 * - 샘플 이미지 생성 (차트, 다이어그램)
 */
class ImageUtils {
  /**
   * 이미지 파일을 Base64로 인코딩하는 메서드
   * GPT-4 Vision API에 이미지를 전송할 때 사용됩니다.
   * 
   * @param {string} imagePath - 인코딩할 이미지 파일 경로
   * @returns {string|null} Base64 인코딩된 이미지 문자열 또는 오류 시 null
   */
  static async encodeImage(imagePath) {
    try {
      // 이미지 파일을 버퍼로 읽기
      const imageBuffer = await fs.readFile(imagePath);
      // 버퍼를 Base64 문자열로 변환
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('이미지 인코딩 오류:', error.message);
      return null;
    }
  }
  
  /**
   * URL에서 이미지를 다운로드하는 메서드
   * DALL-E로 생성된 이미지나 외부 이미지를 로컬에 저장할 때 사용됩니다.
   * 
   * @param {string} url - 다운로드할 이미지 URL
   * @param {string} outputPath - 저장할 파일 경로
   * @returns {boolean} 다운로드 성공 여부
   */
  static async downloadImage(url, outputPath) {
    try {
      // 이미지를 바이너리 데이터로 다운로드
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      // 파일로 저장
      await fs.writeFile(outputPath, response.data);
      console.log(`이미지 다운로드 완료: ${outputPath}`);
      return true;
    } catch (error) {
      console.error('이미지 다운로드 오류:', error.message);
      return false;
    }
  }
  
  /**
   * 샘플 차트 이미지를 생성하는 메서드
   * 
   * 실제 차트 라이브러리 대신 SVG를 직접 생성하여 샘플 차트를 만듭니다.
   * 월별 매출 데이터를 보여주는 막대 차트를 생성합니다.
   * 
   * @returns {string} 생성된 차트 파일 경로
   */
  static async createSampleChart() {
    // SVG 형식의 막대 차트 정의
    const svgChart = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <text x="200" y="30" text-anchor="middle" font-size="20" font-weight="bold">월별 매출 차트</text>
      
      <!-- 막대 그래프 (5개월 데이터) -->
      <rect x="50" y="200" width="40" height="80" fill="#4CAF50"/>   <!-- 1월: 80 -->
      <rect x="110" y="150" width="40" height="130" fill="#2196F3"/> <!-- 2월: 130 -->
      <rect x="170" y="170" width="40" height="110" fill="#FF9800"/> <!-- 3월: 110 -->
      <rect x="230" y="140" width="40" height="140" fill="#F44336"/> <!-- 4월: 140 -->
      <rect x="290" y="120" width="40" height="160" fill="#9C27B0"/> <!-- 5월: 160 -->
      
      <!-- 월 레이블 -->
      <text x="70" y="295" text-anchor="middle">1월</text>
      <text x="130" y="295" text-anchor="middle">2월</text>
      <text x="190" y="295" text-anchor="middle">3월</text>
      <text x="250" y="295" text-anchor="middle">4월</text>
      <text x="310" y="295" text-anchor="middle">5월</text>
      
      <!-- 값 레이블 (막대 위에 표시) -->
      <text x="70" y="195" text-anchor="middle" fill="white">80</text>
      <text x="130" y="145" text-anchor="middle" fill="white">130</text>
      <text x="190" y="165" text-anchor="middle" fill="white">110</text>
      <text x="250" y="135" text-anchor="middle" fill="white">140</text>
      <text x="310" y="115" text-anchor="middle" fill="white">160</text>
    </svg>
    `;
    
    // SVG 파일로 저장
    const chartPath = join(__dirname, 'sample_chart.svg');
    await fs.writeFile(chartPath, svgChart);
    return chartPath;
  }
  
  /**
   * 샘플 시스템 아키텍처 다이어그램을 생성하는 메서드
   * 
   * 마이크로서비스 아키텍처의 기본 구조를 보여주는 다이어그램을 생성합니다.
   * 컴포넌트 간의 연결과 데이터 흐름을 시각적으로 표현합니다.
   * 
   * @returns {string} 생성된 다이어그램 파일 경로
   */
  static async createSampleDiagram() {
    // SVG 형식의 시스템 아키텍처 다이어그램 정의
    const svgDiagram = `
    <svg width="500" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="400" fill="#ffffff"/>
      <text x="250" y="30" text-anchor="middle" font-size="20" font-weight="bold">시스템 아키텍처</text>
      
      <!-- 시스템 컴포넌트 박스들 -->
      <rect x="50" y="80" width="120" height="60" fill="#E3F2FD" stroke="#1976D2" stroke-width="2"/>
      <text x="110" y="115" text-anchor="middle">Frontend</text>
      
      <rect x="190" y="80" width="120" height="60" fill="#F3E5F5" stroke="#7B1FA2" stroke-width="2"/>
      <text x="250" y="115" text-anchor="middle">API Gateway</text>
      
      <rect x="330" y="80" width="120" height="60" fill="#E8F5E9" stroke="#388E3C" stroke-width="2"/>
      <text x="390" y="115" text-anchor="middle">Backend</text>
      
      <rect x="120" y="200" width="120" height="60" fill="#FFF3E0" stroke="#F57C00" stroke-width="2"/>
      <text x="180" y="235" text-anchor="middle">Database</text>
      
      <rect x="260" y="200" width="120" height="60" fill="#FCE4EC" stroke="#C2185B" stroke-width="2"/>
      <text x="320" y="235" text-anchor="middle">Cache</text>
      
      <!-- 컴포넌트 간 연결선 (화살표 포함) -->
      <line x1="110" y1="140" x2="250" y2="140" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="250" y1="140" x2="390" y2="140" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="390" y1="140" x2="180" y2="200" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="390" y1="140" x2="320" y2="200" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- 화살표 마커 정의 -->
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#666"/>
        </marker>
      </defs>
      
      <!-- 다이어그램 설명 텍스트 -->
      <text x="250" y="320" text-anchor="middle" font-size="14" fill="#666">
        클라이언트 → API Gateway → 백엔드 서비스 → 데이터 저장소
      </text>
    </svg>
    `;
    
    // SVG 파일로 저장
    const diagramPath = join(__dirname, 'sample_diagram.svg');
    await fs.writeFile(diagramPath, svgDiagram);
    return diagramPath;
  }
}

/**
 * 멀티모달 분석 클래스
 * 
 * GPT-4 Vision API를 사용하여 이미지를 분석하고 이해하는 기능을 제공합니다.
 * - 단일 이미지 분석
 * - 여러 이미지 비교
 * - 이미지 기반 질의응답
 */
class MultimodalAnalyzer {
  /**
   * 단일 이미지를 분석하는 메서드
   * 
   * GPT-4 Vision API를 사용하여 이미지의 내용을 분석하고 설명합니다.
   * 
   * @param {string} imagePath - 분석할 이미지 파일 경로
   * @param {string} prompt - 분석 요청 프롬프트 (기본값: 일반적인 설명 요청)
   * @returns {string|null} 분석 결과 또는 오류 시 null
   */
  async analyzeImage(imagePath, prompt = '이 이미지를 자세히 설명해주세요.') {
    console.log('\n=== 이미지 분석 ===');
    console.log(`이미지: ${imagePath}`);
    console.log(`프롬프트: ${prompt}\n`);
    
    try {
      // 이미지를 Base64로 인코딩
      const base64Image = await ImageUtils.encodeImage(imagePath);
      
      if (!base64Image) {
        throw new Error('이미지 인코딩 실패');
      }
      
      // GPT-4 Vision API 호출
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',  // GPT-4 Vision 모델
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',           // 텍스트 프롬프트
                text: prompt
              },
              {
                type: 'image_url',      // 이미지 URL (Base64)
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'        // 이미지 상세도: 'low', 'high', 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 500,  // 최대 응답 토큰 수
      });
      
      const analysis = response.choices[0].message.content;
      console.log('분석 결과:');
      console.log(analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('이미지 분석 오류:', error.message);
      
      // GPT-4 Vision API 접근 권한이 없는 경우 시뮬레이션 응답 제공
      if (error.message.includes('model')) {
        console.log('\n[주의] GPT-4 Vision API 접근 권한이 필요합니다.');
        console.log('대신 시뮬레이션된 응답을 제공합니다.\n');
        return this.simulateImageAnalysis(imagePath, prompt);
      }
      return null;
    }
  }
  
  /**
   * GPT-4 Vision API가 없을 때 사용하는 시뮬레이션된 이미지 분석
   * 
   * @param {string} imagePath - 이미지 파일 경로
   * @param {string} prompt - 분석 프롬프트
   * @returns {string} 시뮬레이션된 분석 결과
   */
  simulateImageAnalysis(imagePath, prompt) {
    const fileName = imagePath.split('/').pop();
    
    // 파일명에 따라 다른 시뮬레이션 응답 제공
    if (fileName.includes('chart')) {
      return `이 이미지는 막대 차트를 보여줍니다. 5개월간의 데이터가 표시되어 있으며, 
      각 막대는 다른 색상으로 구분됩니다. 1월부터 5월까지 전반적으로 상승 추세를 보이고 있으며,
      4월에 최고점을 기록한 후 5월에 약간 하락했습니다. 차트는 명확한 레이블과 값을 포함하고 있어
      데이터를 쉽게 이해할 수 있습니다.`;
    } else if (fileName.includes('diagram')) {
      return `이 이미지는 시스템 아키텍처 다이어그램입니다. Frontend, API Gateway, Backend 컴포넌트가
      순차적으로 연결되어 있으며, Backend는 Database와 Cache 두 개의 데이터 저장소와 연결됩니다.
      화살표는 데이터 흐름의 방향을 나타내며, 각 컴포넌트는 다른 색상으로 구분되어 있습니다.
      전체적으로 마이크로서비스 아키텍처의 기본 구조를 보여줍니다.`;
    } else {
      return `이미지 분석 시뮬레이션: ${fileName}에 대한 일반적인 설명입니다.
      실제 GPT-4 Vision API를 사용하면 더 정확한 분석이 가능합니다.`;
    }
  }
  
  /**
   * 여러 이미지를 비교 분석하는 메서드
   * 
   * @param {string[]} imagePaths - 비교할 이미지 파일 경로들의 배열
   * @param {string} comparisonPrompt - 비교 요청 프롬프트
   * @returns {string|null} 비교 분석 결과 또는 오류 시 null
   */
  async compareImages(imagePaths, comparisonPrompt) {
    console.log('\n=== 이미지 비교 분석 ===');
    console.log(`이미지 수: ${imagePaths.length}`);
    console.log(`비교 요청: ${comparisonPrompt}\n`);
    
    try {
      const imageContents = [];
      
      // 모든 이미지를 Base64로 인코딩
      for (const path of imagePaths) {
        const base64Image = await ImageUtils.encodeImage(path);
        if (base64Image) {
          imageContents.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'low'  // 여러 이미지는 low detail 사용 (성능 최적화)
            }
          });
        }
      }
      
      // 텍스트 프롬프트를 맨 앞에 추가
      imageContents.unshift({
        type: 'text',
        text: comparisonPrompt
      });
      
      // GPT-4 Vision API 호출
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: imageContents
          }
        ],
        max_tokens: 600,  // 비교 분석이므로 더 긴 응답 허용
      });
      
      const comparison = response.choices[0].message.content;
      console.log('비교 분석 결과:');
      console.log(comparison);
      
      return comparison;
      
    } catch (error) {
      console.error('비교 분석 오류:', error.message);
      console.log('\n[시뮬레이션] 두 이미지를 비교하면:');
      console.log('- 첫 번째 이미지는 데이터 시각화(차트)를 보여줍니다');
      console.log('- 두 번째 이미지는 시스템 구조(다이어그램)를 보여줍니다');
      console.log('- 두 이미지 모두 정보를 시각적으로 전달하는 목적을 가지고 있습니다');
      return null;
    }
  }
  
  /**
   * 이미지에 대한 질의응답을 수행하는 메서드
   * 
   * @param {string} imagePath - 질문할 이미지 파일 경로
   * @param {string[]} questions - 질문들의 배열
   */
  async imageQA(imagePath, questions) {
    console.log('\n=== 이미지 기반 Q&A ===');
    console.log(`이미지: ${imagePath}\n`);
    
    // 이미지를 Base64로 인코딩
    const base64Image = await ImageUtils.encodeImage(imagePath);
    if (!base64Image) {
      console.error('이미지 인코딩 실패');
      return;
    }
    
    // 각 질문에 대해 답변 생성
    for (const question of questions) {
      console.log(`Q: ${question}`);
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: question
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'  // 질의응답은 높은 상세도 사용
                  }
                }
              ]
            }
          ],
          max_tokens: 200,  // 질의응답은 짧은 응답
        });
        
        console.log(`A: ${response.choices[0].message.content}\n`);
        
      } catch (error) {
        // API 오류 시 시뮬레이션 응답 제공
        console.log(`A: [시뮬레이션] ${this.getSimulatedAnswer(question)}\n`);
      }
      
      // API 호출 간 대기 (rate limiting 방지)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  /**
   * 시뮬레이션된 질의응답 답변 생성
   * 
   * @param {string} question - 질문
   * @returns {string} 시뮬레이션된 답변
   */
  getSimulatedAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    
    // 질문 내용에 따라 다른 답변 제공
    if (lowerQuestion.includes('색') || lowerQuestion.includes('color')) {
      return '차트에는 녹색, 파란색, 주황색, 빨간색, 보라색이 사용되었습니다.';
    } else if (lowerQuestion.includes('높') || lowerQuestion.includes('최대')) {
      return '4월이 140으로 가장 높은 값을 보여줍니다.';
    } else if (lowerQuestion.includes('구조') || lowerQuestion.includes('컴포넌트')) {
      return 'Frontend, API Gateway, Backend, Database, Cache 컴포넌트로 구성되어 있습니다.';
    } else {
      return '이미지에서 해당 정보를 찾을 수 있습니다.';
    }
  }
}

/**
 * 이미지 생성 클래스
 * 
 * DALL-E API를 사용하여 이미지를 생성하고 변형하는 기능을 제공합니다.
 * - 텍스트 프롬프트로 이미지 생성
 * - 기존 이미지의 변형 생성
 */
class ImageGenerator {
  /**
   * DALL-E를 사용하여 이미지를 생성하는 메서드
   * 
   * @param {string} prompt - 이미지 생성 프롬프트
   * @param {string} size - 이미지 크기 (기본값: '1024x1024')
   * @returns {object|null} 생성된 이미지 정보 또는 오류 시 null
   */
  async generateImage(prompt, size = '1024x1024') {
    console.log('\n=== 이미지 생성 ===');
    console.log(`프롬프트: ${prompt}`);
    console.log(`크기: ${size}\n`);
    
    try {
      // DALL-E 3 API 호출
      const response = await openai.images.generate({
        model: 'dall-e-3',        // DALL-E 3 모델 사용
        prompt: prompt,           // 이미지 생성 프롬프트
        n: 1,                     // 생성할 이미지 수
        size: size,               // 이미지 크기
        quality: 'standard',      // 이미지 품질: 'standard' 또는 'hd'
        style: 'natural',         // 스타일: 'natural' 또는 'vivid'
      });
      
      const imageUrl = response.data[0].url;
      console.log('생성된 이미지 URL:', imageUrl);
      
      // 생성된 이미지를 로컬에 다운로드
      const outputPath = join(__dirname, `generated_${Date.now()}.png`);
      await ImageUtils.downloadImage(imageUrl, outputPath);
      
      return { url: imageUrl, path: outputPath };
      
    } catch (error) {
      console.error('이미지 생성 오류:', error.message);
      console.log('\n[주의] DALL-E API 접근 권한이 필요합니다.');
      return null;
    }
  }
  
  /**
   * 기존 이미지의 변형을 생성하는 메서드
   * 
   * @param {string} imagePath - 변형할 원본 이미지 경로
   * @returns {Array|null} 생성된 변형 이미지들 또는 오류 시 null
   */
  async createVariation(imagePath) {
    console.log('\n=== 이미지 변형 생성 ===');
    console.log(`원본 이미지: ${imagePath}\n`);
    
    try {
      // 이미지 파일을 버퍼로 읽기
      const imageBuffer = await fs.readFile(imagePath);
      
      // DALL-E 변형 생성 API 호출
      const response = await openai.images.createVariation({
        image: imageBuffer,       // 원본 이미지 버퍼
        n: 2,                     // 생성할 변형 수
        size: '1024x1024',        // 변형 이미지 크기
      });
      
      console.log(`${response.data.length}개의 변형 생성됨`);
      response.data.forEach((img, i) => {
        console.log(`변형 ${i + 1}: ${img.url}`);
      });
      
      return response.data;
      
    } catch (error) {
      console.error('변형 생성 오류:', error.message);
      console.log('[주의] 이미지 변형 API는 PNG 형식만 지원합니다.');
      return null;
    }
  }
}

/**
 * 실용적인 멀티모달 사용 사례 클래스
 * 
 * 멀티모달 AI의 실제 활용 사례들을 구현합니다.
 * - OCR (광학 문자 인식) 시뮬레이션
 * - 접근성을 위한 대체 텍스트 생성
 * - 차트/표에서 데이터 추출
 */
class PracticalUseCases {
  constructor() {
    this.analyzer = new MultimodalAnalyzer();  // 이미지 분석기
    this.generator = new ImageGenerator();     // 이미지 생성기
  }
  
  /**
   * 이미지에서 텍스트를 추출하는 OCR 시뮬레이션
   * 
   * @param {string} imagePath - 텍스트를 추출할 이미지 경로
   * @returns {string} 추출된 텍스트
   */
  async extractText(imagePath) {
    console.log('\n=== 이미지에서 텍스트 추출 (OCR) ===');
    
    const prompt = `이 이미지에서 모든 텍스트를 추출해주세요. 
    텍스트만 나열하고, 구조를 유지해주세요.`;
    
    return await this.analyzer.analyzeImage(imagePath, prompt);
  }
  
  /**
   * 접근성을 위한 대체 텍스트(alt text)를 생성하는 메서드
   * 
   * 시각 장애인을 위해 이미지의 내용을 설명하는 텍스트를 생성합니다.
   * 
   * @param {string} imagePath - 대체 텍스트를 생성할 이미지 경로
   * @returns {string} 생성된 대체 텍스트
   */
  async generateAltText(imagePath) {
    console.log('\n=== 접근성을 위한 대체 텍스트 생성 ===');
    
    const prompt = `이 이미지에 대한 간결하고 설명적인 대체 텍스트(alt text)를 생성해주세요.
    시각 장애인이 이미지의 내용을 이해할 수 있도록 작성해주세요.`;
    
    return await this.analyzer.analyzeImage(imagePath, prompt);
  }
  
  /**
   * 차트나 표에서 데이터를 추출하는 메서드
   * 
   * @param {string} imagePath - 데이터를 추출할 차트/표 이미지 경로
   * @returns {string} 추출된 데이터 (JSON 형식)
   */
  async extractData(imagePath) {
    console.log('\n=== 차트/표에서 데이터 추출 ===');
    
    const prompt = `이 차트나 표에서 데이터를 추출해주세요.
    JSON 형식으로 구조화하여 제공해주세요.`;
    
    return await this.analyzer.analyzeImage(imagePath, prompt);
  }
}

/**
 * 메인 실행 함수
 * 
 * 전체 멀티모달 시스템의 데모를 실행합니다.
 * 1. 샘플 이미지 생성
 * 2. 이미지 분석 및 비교
 * 3. 이미지 기반 질의응답
 * 4. 실용적 사용 사례
 * 5. 이미지 생성 (선택적)
 */
async function main() {
  console.log('=== 고급 예제 2: 멀티모달 처리 ===\n');
  
  // 샘플 이미지 생성
  console.log('샘플 이미지 생성 중...');
  const chartPath = await ImageUtils.createSampleChart();      // 차트 이미지 생성
  const diagramPath = await ImageUtils.createSampleDiagram();  // 다이어그램 이미지 생성
  console.log('✓ 샘플 차트 생성됨');
  console.log('✓ 샘플 다이어그램 생성됨\n');
  
  // 각 클래스의 인스턴스 생성
  const analyzer = new MultimodalAnalyzer();    // 이미지 분석기
  const generator = new ImageGenerator();       // 이미지 생성기
  const useCases = new PracticalUseCases();     // 실용적 사용 사례
  
  // 1. 단일 이미지 분석
  await analyzer.analyzeImage(chartPath, '이 차트가 보여주는 트렌드를 분석해주세요.');
  
  console.log('\n' + '='.repeat(50));  // 구분선
  
  // 2. 이미지 비교 분석
  await analyzer.compareImages(
    [chartPath, diagramPath],
    '이 두 이미지의 목적과 정보 전달 방식을 비교해주세요.'
  );
  
  console.log('\n' + '='.repeat(50));  // 구분선
  
  // 3. 이미지 기반 질의응답
  const questions = [
    '차트에서 가장 높은 값은 몇월입니까?',
    '어떤 색상들이 사용되었나요?',
    '전체적인 추세는 어떤가요?'
  ];
  await analyzer.imageQA(chartPath, questions);
  
  console.log('\n' + '='.repeat(50));  // 구분선
  
  // 4. 실용적 사용 사례들
  await useCases.generateAltText(chartPath);  // 접근성을 위한 대체 텍스트 생성
  
  console.log('\n' + '='.repeat(50));  // 구분선
  
  await useCases.extractData(chartPath);      // 차트에서 데이터 추출
  
  console.log('\n' + '='.repeat(50));  // 구분선
  
  // 5. 이미지 생성 (선택적 - DALL-E API 접근 권한이 있는 경우)
  const generateNewImage = false; // DALL-E API 사용 시 true로 변경
  
  if (generateNewImage) {
    await generator.generateImage(
      'A futuristic dashboard showing various charts and graphs with neon colors on dark background',
      '1024x1024'
    );
  } else {
    console.log('\n[정보] 이미지 생성은 DALL-E API 접근 권한이 필요합니다.');
    console.log('generateNewImage를 true로 설정하여 활성화할 수 있습니다.');
  }
  
  // 6. 생성된 임시 파일들 정리
  console.log('\n=== 생성된 파일 정리 ===');
  try {
    await fs.unlink(chartPath);     // 차트 파일 삭제
    await fs.unlink(diagramPath);   // 다이어그램 파일 삭제
    console.log('✓ 임시 파일 삭제 완료');
  } catch (error) {
    console.log('파일 정리 중 오류:', error.message);
  }
  
  console.log('\n=== 멀티모달 처리 데모 완료 ===');
}

// 프로그램 실행 (오류 처리 포함)
main().catch(console.error);
