/**
 * 고급 예제 1: RAG (Retrieval-Augmented Generation) 시스템
 * 
 * 이 파일은 RAG 시스템의 완전한 구현을 보여줍니다.
 * RAG는 검색(Retrieval)과 생성(Generation)을 결합한 AI 시스템으로,
 * 관련 문서를 검색하여 컨텍스트로 사용하고 더 정확한 답변을 생성합니다.
 * 
 * 주요 구성 요소:
 * 1. VectorStore: 문서 임베딩과 벡터 검색을 담당
 * 2. RAGSystem: RAG 기반 질의응답 시스템
 * 3. InteractiveRAG: 대화형 RAG 시스템
 * 
 * 사용 기술:
 * - OpenAI Embeddings API: 텍스트를 벡터로 변환
 * - OpenAI Chat Completions API: 답변 생성
 * - 코사인 유사도: 벡터 간 유사도 계산
 * - 청킹: 긴 문서를 작은 조각으로 분할
 */

// 필요한 라이브러리들을 가져옵니다
import OpenAI from 'openai';        // OpenAI API 클라이언트
import dotenv from 'dotenv';        // 환경변수 관리
import fs from 'fs/promises';       // 파일 시스템 작업 (비동기)
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
 * 벡터 데이터베이스 시뮬레이션 클래스
 * 
 * 실제 프로덕션에서는 Pinecone, Weaviate, Chroma 등의 벡터 데이터베이스를 사용합니다.
 * 이 클래스는 교육 목적으로 메모리 기반 벡터 스토어를 구현합니다.
 */
class VectorStore {
  constructor() {
    this.documents = [];  // 문서와 메타데이터를 저장하는 배열
    this.embeddings = []; // 임베딩 벡터들을 저장하는 배열 (현재는 사용하지 않음)
  }
  
  /**
   * 문서를 벡터 스토어에 추가하는 메서드
   * @param {string} text - 추가할 텍스트 문서
   * @param {object} metadata - 문서의 메타데이터 (제목, 작성일 등)
   */
  async addDocument(text, metadata = {}) {
    // 긴 텍스트를 처리하기 위해 청크로 분할 (최대 500자)
    const chunks = this.splitIntoChunks(text, 500);
    
    // 각 청크에 대해 임베딩을 생성하고 저장
    for (const chunk of chunks) {
      // OpenAI Embeddings API를 사용하여 텍스트를 벡터로 변환
      const embedding = await this.createEmbedding(chunk);
      
      // 문서 정보를 저장
      this.documents.push({
        id: this.documents.length,  // 고유 ID (순차 번호)
        text: chunk,                // 청크 텍스트
        metadata,                   // 메타데이터
        embedding                   // 임베딩 벡터
      });
    }
  }
  
  /**
   * 긴 텍스트를 작은 청크로 분할하는 메서드
   * 문장 단위로 분할하여 의미를 유지하면서 크기를 제한합니다.
   * 
   * @param {string} text - 분할할 텍스트
   * @param {number} maxLength - 각 청크의 최대 길이
   * @returns {string[]} 분할된 청크들의 배열
   */
  splitIntoChunks(text, maxLength) {
    // 문장 단위로 텍스트를 분할 (마침표, 느낌표, 물음표 기준)
    const sentences = text.split(/[.!?]\s+/);
    const chunks = [];
    let currentChunk = '';
    
    // 각 문장을 순회하면서 청크를 구성
    for (const sentence of sentences) {
      // 현재 청크에 새 문장을 추가했을 때 최대 길이를 초과하는지 확인
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        // 최대 길이를 초과하면 현재 청크를 저장하고 새 청크 시작
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        // 최대 길이 내라면 현재 청크에 문장 추가
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    // 마지막 청크가 남아있다면 추가
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  /**
   * OpenAI Embeddings API를 사용하여 텍스트를 벡터로 변환하는 메서드
   * 
   * @param {string} text - 임베딩할 텍스트
   * @returns {number[]|null} 임베딩 벡터 또는 오류 시 null
   */
  async createEmbedding(text) {
    try {
      // OpenAI Embeddings API 호출
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002', // OpenAI의 임베딩 모델
        input: text,                     // 임베딩할 텍스트
      });
      
      // 응답에서 임베딩 벡터 추출 (1536차원 벡터)
      return response.data[0].embedding;
    } catch (error) {
      console.error('임베딩 생성 오류:', error.message);
      return null;
    }
  }
  
  /**
   * 두 벡터 간의 코사인 유사도를 계산하는 메서드
   * 코사인 유사도는 -1에서 1 사이의 값으로, 1에 가까울수록 유사함을 의미합니다.
   * 
   * @param {number[]} vec1 - 첫 번째 벡터
   * @param {number[]} vec2 - 두 번째 벡터
   * @returns {number} 코사인 유사도 값
   */
  cosineSimilarity(vec1, vec2) {
    // 벡터가 유효하지 않으면 0 반환
    if (!vec1 || !vec2) return 0;
    
    let dotProduct = 0;  // 내적
    let norm1 = 0;       // 첫 번째 벡터의 크기 제곱
    let norm2 = 0;       // 두 번째 벡터의 크기 제곱
    
    // 벡터의 각 차원에 대해 계산
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];  // 내적 계산
      norm1 += vec1[i] * vec1[i];       // 첫 번째 벡터 크기 제곱
      norm2 += vec2[i] * vec2[i];       // 두 번째 벡터 크기 제곱
    }
    
    // 코사인 유사도 공식: 내적 / (벡터1 크기 * 벡터2 크기)
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
  
  /**
   * 쿼리와 유사한 문서들을 검색하는 메서드
   * 
   * @param {string} query - 검색 쿼리
   * @param {number} topK - 반환할 상위 문서 수 (기본값: 3)
   * @returns {Array} 유사도 순으로 정렬된 문서 배열
   */
  async search(query, topK = 3) {
    // 쿼리를 임베딩 벡터로 변환
    const queryEmbedding = await this.createEmbedding(query);
    
    // 임베딩 생성에 실패한 경우 빈 배열 반환
    if (!queryEmbedding) {
      return [];
    }
    
    // 모든 문서와 쿼리 간의 유사도를 계산
    const similarities = this.documents.map(doc => ({
      ...doc,  // 기존 문서 정보 유지
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)  // 유사도 추가
    }));
    
    // 유사도 기준으로 내림차순 정렬 (가장 유사한 것이 먼저)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // 상위 K개 문서만 반환 (필요한 정보만 추출)
    return similarities.slice(0, topK).map(doc => ({
      text: doc.text,           // 문서 텍스트
      metadata: doc.metadata,   // 메타데이터
      similarity: doc.similarity // 유사도 점수
    }));
  }
  
  /**
   * 벡터 스토어의 통계 정보를 반환하는 메서드
   * 
   * @returns {object} 통계 정보 객체
   */
  getStats() {
    return {
      documentCount: this.documents.length,  // 총 문서 수
      totalCharacters: this.documents.reduce((sum, doc) => sum + doc.text.length, 0),  // 총 문자 수
      averageChunkSize: this.documents.length > 0 
        ? Math.floor(this.documents.reduce((sum, doc) => sum + doc.text.length, 0) / this.documents.length)  // 평균 청크 크기
        : 0
    };
  }
}

/**
 * RAG (Retrieval-Augmented Generation) 시스템 클래스
 * 
 * 이 클래스는 검색과 생성을 결합하여 정확한 답변을 생성합니다.
 * 1. 사용자 질문과 관련된 문서를 검색
 * 2. 검색된 문서를 컨텍스트로 사용하여 답변 생성
 * 3. 할루시네이션을 줄이고 사실 기반 답변 제공
 */
class RAGSystem {
  constructor() {
    this.vectorStore = new VectorStore();  // 벡터 스토어 인스턴스 생성
  }
  
  /**
   * 지식 베이스를 구축하는 메서드
   * 샘플 문서들을 벡터 스토어에 추가합니다.
   */
  async buildKnowledgeBase() {
    console.log('지식 베이스 구축 중...\n');
    
    // 샘플 문서들 (실제로는 파일이나 데이터베이스에서 로드)
    const documents = [
      {
        title: 'OpenAI GPT 모델',
        content: `GPT (Generative Pre-trained Transformer)는 OpenAI에서 개발한 대규모 언어 모델입니다. 
        GPT-3는 1750억 개의 파라미터를 가지고 있으며, 다양한 자연어 처리 작업을 수행할 수 있습니다.
        GPT-4는 멀티모달 기능을 지원하여 이미지와 텍스트를 함께 처리할 수 있습니다.
        이 모델들은 few-shot learning 능력이 뛰어나며, 프롬프트 엔지니어링을 통해 다양한 작업을 수행할 수 있습니다.`
      },
      {
        title: 'RAG 시스템',
        content: `RAG (Retrieval-Augmented Generation)는 검색과 생성을 결합한 AI 시스템입니다.
        먼저 관련 문서를 검색하고, 검색된 문서를 컨텍스트로 사용하여 더 정확한 답변을 생성합니다.
        RAG는 할루시네이션을 줄이고, 최신 정보를 반영할 수 있는 장점이 있습니다.
        벡터 데이터베이스를 사용하여 문서를 임베딩하고, 의미적 유사도를 기반으로 검색합니다.`
      },
      {
        title: '프롬프트 엔지니어링',
        content: `프롬프트 엔지니어링은 AI 모델에게 효과적인 지시사항을 작성하는 기술입니다.
        좋은 프롬프트는 명확하고 구체적이며, 원하는 출력 형식을 명시합니다.
        Few-shot 예제를 제공하면 모델의 성능을 크게 향상시킬 수 있습니다.
        Chain-of-Thought (CoT) 프롬프팅은 복잡한 추론 작업에 효과적입니다.`
      },
      {
        title: '임베딩과 벡터 검색',
        content: `임베딩은 텍스트를 고차원 벡터 공간의 숫자 배열로 변환하는 과정입니다.
        의미적으로 유사한 텍스트는 벡터 공간에서 가까운 위치에 배치됩니다.
        코사인 유사도는 두 벡터 간의 각도를 측정하여 유사성을 계산합니다.
        벡터 검색은 전통적인 키워드 검색보다 의미적 이해가 뛰어납니다.`
      },
      {
        title: 'LLM 파인튜닝',
        content: `파인튜닝은 사전 학습된 모델을 특정 작업에 맞게 추가 학습시키는 과정입니다.
        LoRA (Low-Rank Adaptation)는 효율적인 파인튜닝 방법으로, 적은 파라미터만 학습합니다.
        RLHF (Reinforcement Learning from Human Feedback)는 인간의 피드백을 활용한 학습 방법입니다.
        파인튜닝을 통해 도메인 특화 모델을 만들 수 있습니다.`
      }
    ];
    
    // 각 문서를 벡터 스토어에 추가
    for (const doc of documents) {
      await this.vectorStore.addDocument(doc.content, { title: doc.title });
      console.log(`✓ "${doc.title}" 문서 추가됨`);
    }
    
    // 통계 정보 출력
    const stats = this.vectorStore.getStats();
    console.log(`\n총 ${stats.documentCount}개 청크, 평균 ${stats.averageChunkSize}자\n`);
  }
  
  /**
   * RAG 기반 질의응답을 수행하는 메서드
   * 
   * @param {string} question - 사용자 질문
   * @param {boolean} useRAG - RAG 사용 여부 (true: RAG 사용, false: 일반 생성)
   * @returns {object} 답변과 출처 정보
   */
  async query(question, useRAG = true) {
    console.log(`\n질문: ${question}`);
    console.log(`RAG 사용: ${useRAG ? '예' : '아니오'}\n`);
    
    let context = '';    // 컨텍스트 텍스트
    let sources = [];    // 출처 문서들
    
    if (useRAG) {
      // 관련 문서 검색 (상위 3개)
      const relevantDocs = await this.vectorStore.search(question, 3);
      
      if (relevantDocs.length > 0) {
        console.log('검색된 관련 문서:');
        // 각 관련 문서의 정보 출력
        relevantDocs.forEach((doc, i) => {
          console.log(`${i + 1}. [유사도: ${doc.similarity.toFixed(3)}] ${doc.metadata.title || 'Unknown'}`);
          sources.push(doc.metadata.title || 'Unknown');
        });
        
        // 검색된 문서들을 하나의 컨텍스트로 결합
        context = relevantDocs.map(doc => doc.text).join('\n\n');
      } else {
        console.log('관련 문서를 찾을 수 없습니다.');
      }
    }
    
    // OpenAI API에 전송할 메시지 배열 구성
    const messages = [
      {
        role: 'system',
        content: useRAG 
          ? `당신은 제공된 컨텍스트를 기반으로 정확한 답변을 제공하는 AI 어시스턴트입니다.
             컨텍스트에 없는 내용은 추측하지 말고, 모른다고 답변하세요.`
          : '당신은 도움이 되는 AI 어시스턴트입니다.'
      }
    ];
    
    // RAG를 사용하는 경우 컨텍스트를 포함한 프롬프트 구성
    if (useRAG && context) {
      messages.push({
        role: 'user',
        content: `컨텍스트:\n${context}\n\n질문: ${question}\n\n위 컨텍스트를 참고하여 질문에 답변해주세요.`
      });
    } else {
      // 일반 생성의 경우 질문만 전송
      messages.push({
        role: 'user',
        content: question
      });
    }
    
    try {
      // OpenAI Chat Completions API 호출
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',  // 사용할 모델
        messages,                // 메시지 배열
        max_tokens: 500,         // 최대 토큰 수 (답변 길이 제한)
        temperature: 0.3,        // 낮은 temperature로 일관된 답변 생성
      });
      
      const answer = response.choices[0].message.content;
      
      console.log('\n답변:');
      console.log(answer);
      
      // 출처 정보가 있으면 출력
      if (sources.length > 0) {
        console.log('\n출처:', sources.join(', '));
      }
      
      return { answer, sources };
      
    } catch (error) {
      console.error('오류 발생:', error.message);
      return { answer: '답변 생성 중 오류가 발생했습니다.', sources: [] };
    }
  }
  
  /**
   * RAG와 일반 생성을 비교하는 실험 메서드
   * 
   * @param {string} question - 비교할 질문
   */
  async compareRAGvsNormal(question) {
    console.log('\n=== RAG vs 일반 생성 비교 ===');
    
    // RAG를 사용한 답변 생성
    console.log('\n--- RAG 사용 ---');
    const ragResult = await this.query(question, true);
    
    // 일반 생성 (RAG 미사용)
    console.log('\n--- RAG 미사용 (일반 생성) ---');
    const normalResult = await this.query(question, false);
    
    console.log('\n=== 비교 완료 ===');
  }
}

/**
 * 대화형 RAG 시스템 클래스
 * 
 * RAGSystem을 확장하여 대화 히스토리를 유지하는 기능을 추가합니다.
 * 연속적인 대화에서 컨텍스트를 유지하여 더 자연스러운 대화가 가능합니다.
 */
class InteractiveRAG extends RAGSystem {
  constructor() {
    super();  // 부모 클래스 생성자 호출
    this.conversationHistory = [];  // 대화 히스토리를 저장하는 배열
  }
  
  /**
   * 대화형 질의응답을 수행하는 메서드
   * 
   * @param {string} message - 사용자 메시지
   * @returns {string} AI 응답
   */
  async chat(message) {
    // 사용자 메시지를 대화 히스토리에 추가
    this.conversationHistory.push({ role: 'user', content: message });
    
    // 현재 메시지와 관련된 컨텍스트 검색 (상위 2개 문서)
    const relevantDocs = await this.vectorStore.search(message, 2);
    const context = relevantDocs.map(doc => doc.text).join('\n');
    
    // 시스템 메시지와 대화 히스토리를 포함한 메시지 배열 구성
    const messages = [
      {
        role: 'system',
        content: `당신은 RAG 시스템을 사용하는 AI 어시스턴트입니다.
                  제공된 컨텍스트와 대화 히스토리를 참고하여 답변하세요.
                  
                  컨텍스트:
                  ${context}`
      },
      ...this.conversationHistory.slice(-5)  // 최근 5개 메시지만 유지 (메모리 효율성)
    ];
    
    try {
      // OpenAI API 호출
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 400,      // 대화형이므로 답변 길이 제한
        temperature: 0.5,     // 대화형이므로 약간 높은 temperature
      });
      
      const answer = response.choices[0].message.content;
      
      // AI 응답을 대화 히스토리에 추가
      this.conversationHistory.push({ role: 'assistant', content: answer });
      
      return answer;
      
    } catch (error) {
      console.error('오류:', error.message);
      return '답변 생성 중 오류가 발생했습니다.';
    }
  }
}

/**
 * 메인 실행 함수
 * 
 * 전체 RAG 시스템의 데모를 실행합니다.
 * 1. 지식 베이스 구축
 * 2. 다양한 질문으로 테스트
 * 3. RAG vs 일반 생성 비교
 * 4. 대화형 RAG 데모
 */
async function main() {
  console.log('=== 고급 예제 1: RAG 시스템 ===\n');
  
  // RAG 시스템 인스턴스 생성
  const rag = new RAGSystem();
  
  // 1. 지식 베이스 구축
  await rag.buildKnowledgeBase();
  
  // 2. 다양한 질문으로 테스트 (지식 베이스에 있는 내용과 없는 내용 포함)
  const questions = [
    'GPT-4의 특징은 무엇인가요?',                    // 지식 베이스에 있는 내용
    'RAG 시스템의 장점을 설명해주세요.',              // 지식 베이스에 있는 내용
    '프롬프트 엔지니어링에서 Few-shot이란 무엇인가요?', // 지식 베이스에 있는 내용
    'LoRA는 무엇이고 왜 사용하나요?',                // 지식 베이스에 있는 내용
    '양자 컴퓨터에 대해 설명해주세요.'                // 지식 베이스에 없는 내용 (할루시네이션 테스트)
  ];
  
  console.log('\n=== RAG 기반 질의응답 테스트 ===');
  
  // 각 질문에 대해 RAG 기반 답변 생성
  for (const question of questions) {
    await rag.query(question, true);
    console.log('\n' + '='.repeat(50));  // 구분선 출력
    
    // API 호출 간 대기 (rate limiting 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. RAG vs 일반 생성 비교 실험
  console.log('\n\n=== RAG 효과 비교 실험 ===');
  await rag.compareRAGvsNormal('벡터 검색과 키워드 검색의 차이점은 무엇인가요?');
  
  // 4. 대화형 RAG 시스템 데모
  console.log('\n\n=== 대화형 RAG 시스템 데모 ===');
  const chatRAG = new InteractiveRAG();
  await chatRAG.buildKnowledgeBase();  // 대화형 시스템용 지식 베이스 구축
  
  // 연속적인 대화 메시지들
  const chatMessages = [
    'GPT 모델에 대해 알려주세요.',           // 첫 번째 질문
    '그럼 파인튜닝은 어떻게 하나요?',         // 이전 대화를 참고한 후속 질문
    'LoRA에 대해 더 자세히 설명해주세요.'     // 더 구체적인 질문
  ];
  
  // 대화형 질의응답 수행
  for (const msg of chatMessages) {
    console.log(`\n사용자: ${msg}`);
    const response = await chatRAG.chat(msg);
    console.log(`AI: ${response}`);
    
    // API 호출 간 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== RAG 시스템 데모 완료 ===');
}

// 프로그램 실행 (오류 처리 포함)
main().catch(console.error);
