/**
 * 고급 예제 1: RAG (Retrieval-Augmented Generation) 시스템
 * 문서를 임베딩하고 검색하여 컨텍스트 기반 응답을 생성합니다.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
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

// 벡터 데이터베이스 시뮬레이션 (실제로는 Pinecone, Weaviate 등 사용)
class VectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = [];
  }
  
  // 문서 추가
  async addDocument(text, metadata = {}) {
    // 텍스트를 청크로 분할
    const chunks = this.splitIntoChunks(text, 500);
    
    for (const chunk of chunks) {
      // 임베딩 생성
      const embedding = await this.createEmbedding(chunk);
      
      this.documents.push({
        id: this.documents.length,
        text: chunk,
        metadata,
        embedding
      });
    }
  }
  
  // 텍스트를 청크로 분할
  splitIntoChunks(text, maxLength) {
    const sentences = text.split(/[.!?]\s+/);
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  // 임베딩 생성
  async createEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('임베딩 생성 오류:', error.message);
      return null;
    }
  }
  
  // 코사인 유사도 계산
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
  
  // 유사한 문서 검색
  async search(query, topK = 3) {
    const queryEmbedding = await this.createEmbedding(query);
    
    if (!queryEmbedding) {
      return [];
    }
    
    // 모든 문서와 유사도 계산
    const similarities = this.documents.map(doc => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));
    
    // 유사도 기준 정렬
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // 상위 K개 반환
    return similarities.slice(0, topK).map(doc => ({
      text: doc.text,
      metadata: doc.metadata,
      similarity: doc.similarity
    }));
  }
  
  // 통계 정보
  getStats() {
    return {
      documentCount: this.documents.length,
      totalCharacters: this.documents.reduce((sum, doc) => sum + doc.text.length, 0),
      averageChunkSize: this.documents.length > 0 
        ? Math.floor(this.documents.reduce((sum, doc) => sum + doc.text.length, 0) / this.documents.length)
        : 0
    };
  }
}

// RAG 시스템 클래스
class RAGSystem {
  constructor() {
    this.vectorStore = new VectorStore();
  }
  
  // 지식 베이스 구축
  async buildKnowledgeBase() {
    console.log('지식 베이스 구축 중...\n');
    
    // 샘플 문서들
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
    
    // 문서를 벡터 스토어에 추가
    for (const doc of documents) {
      await this.vectorStore.addDocument(doc.content, { title: doc.title });
      console.log(`✓ "${doc.title}" 문서 추가됨`);
    }
    
    const stats = this.vectorStore.getStats();
    console.log(`\n총 ${stats.documentCount}개 청크, 평균 ${stats.averageChunkSize}자\n`);
  }
  
  // RAG 기반 질의응답
  async query(question, useRAG = true) {
    console.log(`\n질문: ${question}`);
    console.log(`RAG 사용: ${useRAG ? '예' : '아니오'}\n`);
    
    let context = '';
    let sources = [];
    
    if (useRAG) {
      // 관련 문서 검색
      const relevantDocs = await this.vectorStore.search(question, 3);
      
      if (relevantDocs.length > 0) {
        console.log('검색된 관련 문서:');
        relevantDocs.forEach((doc, i) => {
          console.log(`${i + 1}. [유사도: ${doc.similarity.toFixed(3)}] ${doc.metadata.title || 'Unknown'}`);
          sources.push(doc.metadata.title || 'Unknown');
        });
        
        // 컨텍스트 구성
        context = relevantDocs.map(doc => doc.text).join('\n\n');
      } else {
        console.log('관련 문서를 찾을 수 없습니다.');
      }
    }
    
    // 프롬프트 구성
    const messages = [
      {
        role: 'system',
        content: useRAG 
          ? `당신은 제공된 컨텍스트를 기반으로 정확한 답변을 제공하는 AI 어시스턴트입니다.
             컨텍스트에 없는 내용은 추측하지 말고, 모른다고 답변하세요.`
          : '당신은 도움이 되는 AI 어시스턴트입니다.'
      }
    ];
    
    if (useRAG && context) {
      messages.push({
        role: 'user',
        content: `컨텍스트:\n${context}\n\n질문: ${question}\n\n위 컨텍스트를 참고하여 질문에 답변해주세요.`
      });
    } else {
      messages.push({
        role: 'user',
        content: question
      });
    }
    
    try {
      // OpenAI API 호출
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.3, // 정확성을 위해 낮은 temperature
      });
      
      const answer = response.choices[0].message.content;
      
      console.log('\n답변:');
      console.log(answer);
      
      if (sources.length > 0) {
        console.log('\n출처:', sources.join(', '));
      }
      
      return { answer, sources };
      
    } catch (error) {
      console.error('오류 발생:', error.message);
      return { answer: '답변 생성 중 오류가 발생했습니다.', sources: [] };
    }
  }
  
  // 비교 실험: RAG vs 일반 생성
  async compareRAGvsNormal(question) {
    console.log('\n=== RAG vs 일반 생성 비교 ===');
    
    // RAG 사용
    console.log('\n--- RAG 사용 ---');
    const ragResult = await this.query(question, true);
    
    // 일반 생성
    console.log('\n--- RAG 미사용 (일반 생성) ---');
    const normalResult = await this.query(question, false);
    
    console.log('\n=== 비교 완료 ===');
  }
}

// 대화형 RAG 시스템
class InteractiveRAG extends RAGSystem {
  constructor() {
    super();
    this.conversationHistory = [];
  }
  
  async chat(message) {
    // 대화 히스토리 추가
    this.conversationHistory.push({ role: 'user', content: message });
    
    // 관련 컨텍스트 검색
    const relevantDocs = await this.vectorStore.search(message, 2);
    const context = relevantDocs.map(doc => doc.text).join('\n');
    
    // 시스템 메시지와 대화 히스토리 구성
    const messages = [
      {
        role: 'system',
        content: `당신은 RAG 시스템을 사용하는 AI 어시스턴트입니다.
                  제공된 컨텍스트와 대화 히스토리를 참고하여 답변하세요.
                  
                  컨텍스트:
                  ${context}`
      },
      ...this.conversationHistory.slice(-5) // 최근 5개 메시지만 유지
    ];
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 400,
        temperature: 0.5,
      });
      
      const answer = response.choices[0].message.content;
      this.conversationHistory.push({ role: 'assistant', content: answer });
      
      return answer;
      
    } catch (error) {
      console.error('오류:', error.message);
      return '답변 생성 중 오류가 발생했습니다.';
    }
  }
}

// 메인 실행 함수
async function main() {
  console.log('=== 고급 예제 1: RAG 시스템 ===\n');
  
  const rag = new RAGSystem();
  
  // 1. 지식 베이스 구축
  await rag.buildKnowledgeBase();
  
  // 2. 다양한 질문으로 테스트
  const questions = [
    'GPT-4의 특징은 무엇인가요?',
    'RAG 시스템의 장점을 설명해주세요.',
    '프롬프트 엔지니어링에서 Few-shot이란 무엇인가요?',
    'LoRA는 무엇이고 왜 사용하나요?',
    '양자 컴퓨터에 대해 설명해주세요.' // 지식 베이스에 없는 내용
  ];
  
  console.log('\n=== RAG 기반 질의응답 테스트 ===');
  
  for (const question of questions) {
    await rag.query(question, true);
    console.log('\n' + '='.repeat(50));
    
    // API 호출 간 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. RAG vs 일반 생성 비교
  console.log('\n\n=== RAG 효과 비교 실험 ===');
  await rag.compareRAGvsNormal('벡터 검색과 키워드 검색의 차이점은 무엇인가요?');
  
  // 4. 대화형 RAG 데모
  console.log('\n\n=== 대화형 RAG 시스템 데모 ===');
  const chatRAG = new InteractiveRAG();
  await chatRAG.buildKnowledgeBase();
  
  const chatMessages = [
    'GPT 모델에 대해 알려주세요.',
    '그럼 파인튜닝은 어떻게 하나요?',
    'LoRA에 대해 더 자세히 설명해주세요.'
  ];
  
  for (const msg of chatMessages) {
    console.log(`\n사용자: ${msg}`);
    const response = await chatRAG.chat(msg);
    console.log(`AI: ${response}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== RAG 시스템 데모 완료 ===');
}

// 프로그램 실행
main().catch(console.error);
