/**
 * 고급 예제 2: 멀티모달 (이미지 + 텍스트) 처리
 * GPT-4 Vision API를 사용하여 이미지와 텍스트를 함께 처리합니다.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import axios from 'axios';
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

// 이미지 유틸리티 클래스
class ImageUtils {
  // 이미지를 base64로 인코딩
  static async encodeImage(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('이미지 인코딩 오류:', error.message);
      return null;
    }
  }
  
  // URL에서 이미지 다운로드
  static async downloadImage(url, outputPath) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      await fs.writeFile(outputPath, response.data);
      console.log(`이미지 다운로드 완료: ${outputPath}`);
      return true;
    } catch (error) {
      console.error('이미지 다운로드 오류:', error.message);
      return false;
    }
  }
  
  // 샘플 이미지 생성 (차트)
  static async createSampleChart() {
    // 실제로는 차트 라이브러리를 사용하겠지만, 여기서는 SVG 텍스트로 대체
    const svgChart = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <text x="200" y="30" text-anchor="middle" font-size="20" font-weight="bold">월별 매출 차트</text>
      
      <!-- 막대 그래프 -->
      <rect x="50" y="200" width="40" height="80" fill="#4CAF50"/>
      <rect x="110" y="150" width="40" height="130" fill="#2196F3"/>
      <rect x="170" y="170" width="40" height="110" fill="#FF9800"/>
      <rect x="230" y="140" width="40" height="140" fill="#F44336"/>
      <rect x="290" y="120" width="40" height="160" fill="#9C27B0"/>
      
      <!-- 레이블 -->
      <text x="70" y="295" text-anchor="middle">1월</text>
      <text x="130" y="295" text-anchor="middle">2월</text>
      <text x="190" y="295" text-anchor="middle">3월</text>
      <text x="250" y="295" text-anchor="middle">4월</text>
      <text x="310" y="295" text-anchor="middle">5월</text>
      
      <!-- 값 -->
      <text x="70" y="195" text-anchor="middle" fill="white">80</text>
      <text x="130" y="145" text-anchor="middle" fill="white">130</text>
      <text x="190" y="165" text-anchor="middle" fill="white">110</text>
      <text x="250" y="135" text-anchor="middle" fill="white">140</text>
      <text x="310" y="115" text-anchor="middle" fill="white">160</text>
    </svg>
    `;
    
    const chartPath = join(__dirname, 'sample_chart.svg');
    await fs.writeFile(chartPath, svgChart);
    return chartPath;
  }
  
  // 샘플 다이어그램 생성
  static async createSampleDiagram() {
    const svgDiagram = `
    <svg width="500" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="400" fill="#ffffff"/>
      <text x="250" y="30" text-anchor="middle" font-size="20" font-weight="bold">시스템 아키텍처</text>
      
      <!-- 컴포넌트 박스들 -->
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
      
      <!-- 연결선 -->
      <line x1="110" y1="140" x2="250" y2="140" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="250" y1="140" x2="390" y2="140" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="390" y1="140" x2="180" y2="200" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="390" y1="140" x2="320" y2="200" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- 화살표 정의 -->
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#666"/>
        </marker>
      </defs>
      
      <!-- 설명 텍스트 -->
      <text x="250" y="320" text-anchor="middle" font-size="14" fill="#666">
        클라이언트 → API Gateway → 백엔드 서비스 → 데이터 저장소
      </text>
    </svg>
    `;
    
    const diagramPath = join(__dirname, 'sample_diagram.svg');
    await fs.writeFile(diagramPath, svgDiagram);
    return diagramPath;
  }
}

// 멀티모달 분석 클래스
class MultimodalAnalyzer {
  // 이미지 분석 (설명)
  async analyzeImage(imagePath, prompt = '이 이미지를 자세히 설명해주세요.') {
    console.log('\n=== 이미지 분석 ===');
    console.log(`이미지: ${imagePath}`);
    console.log(`프롬프트: ${prompt}\n`);
    
    try {
      // 이미지를 base64로 인코딩
      const base64Image = await ImageUtils.encodeImage(imagePath);
      
      if (!base64Image) {
        throw new Error('이미지 인코딩 실패');
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high' // 'low', 'high', 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      });
      
      const analysis = response.choices[0].message.content;
      console.log('분석 결과:');
      console.log(analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('이미지 분석 오류:', error.message);
      // GPT-4 Vision이 없는 경우 대체 응답
      if (error.message.includes('model')) {
        console.log('\n[주의] GPT-4 Vision API 접근 권한이 필요합니다.');
        console.log('대신 시뮬레이션된 응답을 제공합니다.\n');
        return this.simulateImageAnalysis(imagePath, prompt);
      }
      return null;
    }
  }
  
  // 시뮬레이션된 이미지 분석 (GPT-4V 없을 때)
  simulateImageAnalysis(imagePath, prompt) {
    const fileName = imagePath.split('/').pop();
    
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
  
  // 여러 이미지 비교 분석
  async compareImages(imagePaths, comparisonPrompt) {
    console.log('\n=== 이미지 비교 분석 ===');
    console.log(`이미지 수: ${imagePaths.length}`);
    console.log(`비교 요청: ${comparisonPrompt}\n`);
    
    try {
      const imageContents = [];
      
      // 모든 이미지를 인코딩
      for (const path of imagePaths) {
        const base64Image = await ImageUtils.encodeImage(path);
        if (base64Image) {
          imageContents.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'low' // 여러 이미지는 low detail 사용
            }
          });
        }
      }
      
      // 텍스트 프롬프트 추가
      imageContents.unshift({
        type: 'text',
        text: comparisonPrompt
      });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: imageContents
          }
        ],
        max_tokens: 600,
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
  
  // 이미지 기반 질의응답
  async imageQA(imagePath, questions) {
    console.log('\n=== 이미지 기반 Q&A ===');
    console.log(`이미지: ${imagePath}\n`);
    
    const base64Image = await ImageUtils.encodeImage(imagePath);
    if (!base64Image) {
      console.error('이미지 인코딩 실패');
      return;
    }
    
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
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 200,
        });
        
        console.log(`A: ${response.choices[0].message.content}\n`);
        
      } catch (error) {
        // 시뮬레이션 응답
        console.log(`A: [시뮬레이션] ${this.getSimulatedAnswer(question)}\n`);
      }
      
      // API 호출 간 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // 시뮬레이션된 답변
  getSimulatedAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    
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

// 이미지 생성 클래스
class ImageGenerator {
  // DALL-E를 사용한 이미지 생성
  async generateImage(prompt, size = '1024x1024') {
    console.log('\n=== 이미지 생성 ===');
    console.log(`프롬프트: ${prompt}`);
    console.log(`크기: ${size}\n`);
    
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard', // 'standard' or 'hd'
        style: 'natural', // 'natural' or 'vivid'
      });
      
      const imageUrl = response.data[0].url;
      console.log('생성된 이미지 URL:', imageUrl);
      
      // 이미지 다운로드
      const outputPath = join(__dirname, `generated_${Date.now()}.png`);
      await ImageUtils.downloadImage(imageUrl, outputPath);
      
      return { url: imageUrl, path: outputPath };
      
    } catch (error) {
      console.error('이미지 생성 오류:', error.message);
      console.log('\n[주의] DALL-E API 접근 권한이 필요합니다.');
      return null;
    }
  }
  
  // 이미지 편집 (variations)
  async createVariation(imagePath) {
    console.log('\n=== 이미지 변형 생성 ===');
    console.log(`원본 이미지: ${imagePath}\n`);
    
    try {
      const imageBuffer = await fs.readFile(imagePath);
      
      const response = await openai.images.createVariation({
        image: imageBuffer,
        n: 2,
        size: '1024x1024',
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

// 실용적인 멀티모달 사용 사례
class PracticalUseCases {
  constructor() {
    this.analyzer = new MultimodalAnalyzer();
    this.generator = new ImageGenerator();
  }
  
  // OCR 시뮬레이션 (텍스트 추출)
  async extractText(imagePath) {
    console.log('\n=== 이미지에서 텍스트 추출 (OCR) ===');
    
    const prompt = `이 이미지에서 모든 텍스트를 추출해주세요. 
    텍스트만 나열하고, 구조를 유지해주세요.`;
    
    return await this.analyzer.analyzeImage(imagePath, prompt);
  }
  
  // 접근성 설명 생성
  async generateAltText(imagePath) {
    console.log('\n=== 접근성을 위한 대체 텍스트 생성 ===');
    
    const prompt = `이 이미지에 대한 간결하고 설명적인 대체 텍스트(alt text)를 생성해주세요.
    시각 장애인이 이미지의 내용을 이해할 수 있도록 작성해주세요.`;
    
    return await this.analyzer.analyzeImage(imagePath, prompt);
  }
  
  // 데이터 추출
  async extractData(imagePath) {
    console.log('\n=== 차트/표에서 데이터 추출 ===');
    
    const prompt = `이 차트나 표에서 데이터를 추출해주세요.
    JSON 형식으로 구조화하여 제공해주세요.`;
    
    return await this.analyzer.analyzeImage(imagePath, prompt);
  }
}

// 메인 실행 함수
async function main() {
  console.log('=== 고급 예제 2: 멀티모달 처리 ===\n');
  
  // 샘플 이미지 생성
  console.log('샘플 이미지 생성 중...');
  const chartPath = await ImageUtils.createSampleChart();
  const diagramPath = await ImageUtils.createSampleDiagram();
  console.log('✓ 샘플 차트 생성됨');
  console.log('✓ 샘플 다이어그램 생성됨\n');
  
  const analyzer = new MultimodalAnalyzer();
  const generator = new ImageGenerator();
  const useCases = new PracticalUseCases();
  
  // 1. 단일 이미지 분석
  await analyzer.analyzeImage(chartPath, '이 차트가 보여주는 트렌드를 분석해주세요.');
  
  console.log('\n' + '='.repeat(50));
  
  // 2. 이미지 비교
  await analyzer.compareImages(
    [chartPath, diagramPath],
    '이 두 이미지의 목적과 정보 전달 방식을 비교해주세요.'
  );
  
  console.log('\n' + '='.repeat(50));
  
  // 3. 이미지 Q&A
  const questions = [
    '차트에서 가장 높은 값은 몇월입니까?',
    '어떤 색상들이 사용되었나요?',
    '전체적인 추세는 어떤가요?'
  ];
  await analyzer.imageQA(chartPath, questions);
  
  console.log('\n' + '='.repeat(50));
  
  // 4. 실용적 사용 사례
  await useCases.generateAltText(chartPath);
  
  console.log('\n' + '='.repeat(50));
  
  await useCases.extractData(chartPath);
  
  console.log('\n' + '='.repeat(50));
  
  // 5. 이미지 생성 (선택적 - API 키가 있는 경우)
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
  
  // 정리
  console.log('\n=== 생성된 파일 정리 ===');
  try {
    await fs.unlink(chartPath);
    await fs.unlink(diagramPath);
    console.log('✓ 임시 파일 삭제 완료');
  } catch (error) {
    console.log('파일 정리 중 오류:', error.message);
  }
  
  console.log('\n=== 멀티모달 처리 데모 완료 ===');
}

// 프로그램 실행
main().catch(console.error);
