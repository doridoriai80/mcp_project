# MCP (Model Context Protocol) 실습 예제

OpenAI API를 활용한 단계별 MCP 실습 예제 모음입니다. 초급부터 고급까지 다양한 수준의 예제를 통해 AI 애플리케이션 개발을 학습할 수 있습니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [예제 소개](#예제-소개)
  - [초급 예제](#초급-예제)
  - [중급 예제](#중급-예제)
  - [고급 예제](#고급-예제)
- [실행 방법](#실행-방법)
- [API 키 설정](#api-키-설정)
- [주요 개념](#주요-개념)
- [문제 해결](#문제-해결)
- [성능 최적화](#성능-최적화)
- [추가 학습 자료](#추가-학습-자료)

## 🎯 프로젝트 개요

이 프로젝트는 OpenAI API를 활용한 실용적인 AI 애플리케이션 개발 예제들을 제공합니다. 각 예제는 단계별로 구성되어 있어, AI 개발에 처음 입문하는 개발자부터 고급 기능을 구현하고 싶은 개발자까지 모두에게 유용합니다.

### 🎨 주요 특징

- **단계별 학습**: 초급 → 중급 → 고급 순서로 난이도별 구성
- **실용적 예제**: 실제 프로덕션에서 사용할 수 있는 기능들 구현
- **상세한 주석**: 모든 코드에 한글 주석으로 이해하기 쉽게 설명
- **완전한 구현**: 각 예제가 독립적으로 실행 가능한 완전한 애플리케이션
- **최신 기술**: GPT-4 Vision, DALL-E, RAG 등 최신 AI 기술 포함

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: 18.0 이상 (ES modules 지원)
- **npm**: 8.0 이상 또는 yarn
- **OpenAI API 키**: [OpenAI Platform](https://platform.openai.com)에서 발급
- **메모리**: 최소 4GB RAM (고급 예제 실행 시)

### 설치 및 설정

```bash
# 1. 저장소 클론
git clone [repository-url]
cd mcp_project

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp env.example .env

# 4. .env 파일 편집하여 API 키 입력
# OPENAI_API_KEY=sk-your-api-key-here
```

### 빠른 시작

```bash
# 초급 예제부터 시작
npm run beginner-1

# 또는 직접 실행
node examples/beginner/01-text-generation.js
```

## 📁 프로젝트 구조

```
mcp_project/
├── examples/
│   ├── beginner/          # 초급 예제 (기본 API 사용법)
│   │   ├── 01-text-generation.js    # 텍스트 생성 기초
│   │   └── 02-chatbot.js            # 대화형 챗봇
│   ├── intermediate/      # 중급 예제 (고급 기능)
│   │   ├── 01-function-calling.js   # 함수 호출
│   │   └── 02-streaming.js          # 스트리밍 응답
│   └── advanced/          # 고급 예제 (실무 활용)
│       ├── 01-rag-system.js         # RAG 시스템
│       └── 02-multimodal.js         # 멀티모달 처리
├── package.json           # 프로젝트 설정 및 스크립트
├── package-lock.json      # 의존성 잠금 파일
├── env.example           # 환경 변수 템플릿
└── README.md             # 프로젝트 문서
```

## 📚 예제 소개

### 초급 예제 (Beginner)

기본적인 OpenAI API 사용법과 핵심 개념을 학습합니다.

#### 1. 텍스트 생성 (01-text-generation.js)
**학습 목표**: OpenAI API의 기본 사용법과 텍스트 생성

- **주요 기능**:
  - 간단한 텍스트 완성 및 생성
  - Temperature 파라미터를 통한 창의성 조절
  - 다양한 스타일로 텍스트 변환 (공식적, 친근한, 창의적)
  - 토큰 사용량 모니터링 및 비용 계산
  - 프롬프트 엔지니어링 기초

- **핵심 개념**:
  - OpenAI 클라이언트 초기화
  - Chat Completions API 사용법
  - 시스템/사용자/어시스턴트 역할 이해
  - 파라미터 조정 (temperature, max_tokens, top_p)
  - 응답 처리 및 오류 핸들링

- **실행 방법**:
```bash
npm run beginner-1
# 또는
node examples/beginner/01-text-generation.js
```

#### 2. 대화형 챗봇 (02-chatbot.js)
**학습 목표**: 대화 컨텍스트 관리와 인터랙티브 챗봇 구현

- **주요 기능**:
  - 실시간 대화 인터페이스 구현
  - 대화 히스토리 관리 및 컨텍스트 유지
  - 데모 모드와 대화형 모드 전환
  - 토큰 사용량 최적화
  - 세션 관리 및 대화 초기화

- **핵심 개념**:
  - 대화 히스토리 배열 관리
  - 메시지 역할별 구분 (system, user, assistant)
  - 컨텍스트 윈도우 제한 고려
  - 토큰 수 계산 및 최적화
  - 비동기 처리 및 사용자 입력 처리

- **실행 방법**:
```bash
npm run beginner-2
# 또는
node examples/beginner/02-chatbot.js
```

### 중급 예제 (Intermediate)

고급 API 기능과 실용적인 개발 기법을 학습합니다.

#### 1. 함수 호출 (01-function-calling.js)
**학습 목표**: Function Calling을 통한 구조화된 데이터 처리

- **주요 기능**:
  - 날씨 정보 조회 함수 구현
  - 할 일 목록 관리 (추가, 조회, 완료)
  - 계산기 기능 (사칙연산, 통계)
  - 병렬 함수 호출 및 결과 통합
  - 동적 함수 실행 및 오류 처리

- **핵심 개념**:
  - 함수 스키마 정의 (JSON Schema)
  - 함수 파라미터 파싱 및 검증
  - 함수 실행 결과를 AI 응답에 통합
  - 구조화된 출력 생성
  - 함수 호출 체인 및 복합 작업

- **실행 방법**:
```bash
npm run intermediate-1
# 또는
node examples/intermediate/01-function-calling.js
```

#### 2. 스트리밍 응답 (02-streaming.js)
**학습 목표**: 실시간 스트리밍 응답 처리

- **주요 기능**:
  - 기본 스트리밍 응답 처리
  - 실시간 프로그레스 표시
  - 멀티턴 스트리밍 대화
  - 스트리밍 중단 및 재시작
  - JSON 모드 스트리밍
  - 스트리밍 오류 처리

- **핵심 개념**:
  - 비동기 스트림 처리
  - 청크 단위 데이터 수신
  - 실시간 UI 업데이트
  - AbortController를 통한 중단 처리
  - 스트리밍 상태 관리
  - 메모리 효율적인 데이터 처리

- **실행 방법**:
```bash
npm run intermediate-2
# 또는
node examples/intermediate/02-streaming.js
```

### 고급 예제 (Advanced)

실무에서 사용되는 고급 AI 기술을 구현합니다.

#### 1. RAG 시스템 (01-rag-system.js)
**학습 목표**: Retrieval-Augmented Generation 구현

- **주요 기능**:
  - 문서 임베딩 생성 및 저장
  - 벡터 유사도 검색 (코사인 유사도)
  - 컨텍스트 기반 정확한 응답 생성
  - RAG vs 일반 생성 비교 실험
  - 대화형 RAG 시스템
  - 지식 베이스 구축 및 관리

- **핵심 개념**:
  - 텍스트 임베딩 (text-embedding-ada-002)
  - 벡터 유사도 계산 알고리즘
  - 텍스트 청킹 전략
  - 벡터 데이터베이스 시뮬레이션
  - 컨텍스트 주입 및 프롬프트 구성
  - 할루시네이션 방지 기법

- **실행 방법**:
```bash
npm run advanced-1
# 또는
node examples/advanced/01-rag-system.js
```

#### 2. 멀티모달 처리 (02-multimodal.js)
**학습 목표**: 이미지와 텍스트를 함께 처리하는 멀티모달 AI

- **주요 기능**:
  - 이미지 분석 및 상세 설명
  - 여러 이미지 비교 분석
  - 이미지 기반 질의응답
  - OCR 시뮬레이션 (텍스트 추출)
  - 접근성을 위한 대체 텍스트 생성
  - 차트/표에서 데이터 추출
  - DALL-E를 통한 이미지 생성

- **핵심 개념**:
  - GPT-4 Vision API 사용법
  - Base64 이미지 인코딩
  - 멀티모달 프롬프트 구성
  - 이미지 상세도 설정 (low, high, auto)
  - DALL-E 이미지 생성 및 변형
  - 실용적 비전 AI 활용 사례

- **실행 방법**:
```bash
npm run advanced-2
# 또는
node examples/advanced/02-multimodal.js
```

## 🔧 실행 방법

### NPM 스크립트를 통한 실행

```bash
# 초급 예제
npm run beginner-1    # 텍스트 생성
npm run beginner-2    # 대화형 챗봇

# 중급 예제  
npm run intermediate-1    # 함수 호출
npm run intermediate-2    # 스트리밍 응답

# 고급 예제
npm run advanced-1    # RAG 시스템
npm run advanced-2    # 멀티모달 처리
```

### 직접 실행

```bash
# Node.js로 직접 실행
node examples/beginner/01-text-generation.js
node examples/beginner/02-chatbot.js
node examples/intermediate/01-function-calling.js
node examples/intermediate/02-streaming.js
node examples/advanced/01-rag-system.js
node examples/advanced/02-multimodal.js
```

### 개발 모드 실행

```bash
# 디버그 모드로 실행 (더 자세한 로그)
DEBUG=* node examples/beginner/01-text-generation.js

# 특정 예제만 실행
node examples/advanced/01-rag-system.js
```

## 🔑 API 키 설정

### 1. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/api-keys)에 로그인
2. "Create new secret key" 클릭
3. 키 이름 입력 및 생성
4. 생성된 키를 안전한 곳에 복사 (한 번만 표시됨)

### 2. 환경 변수 설정

```bash
# .env 파일 생성
cp env.example .env

# .env 파일 편집
nano .env
```

`.env` 파일 내용:
```env
# OpenAI API 설정
OPENAI_API_KEY=sk-your-api-key-here

# 선택적 설정
OPENAI_ORG_ID=org-your-organization-id  # 조직 ID (선택사항)
NODE_ENV=development                     # 환경 설정
```

### 3. API 키 확인

```bash
# API 키가 올바르게 설정되었는지 확인
node -e "require('dotenv').config(); console.log('API Key:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음')"
```

### API 사용 요금 (2024년 기준)

| 모델 | 입력 (1K 토큰) | 출력 (1K 토큰) | 비고 |
|------|---------------|---------------|------|
| GPT-3.5-turbo | $0.001 | $0.002 | 가장 경제적 |
| GPT-4 | $0.03 | $0.06 | 고품질 응답 |
| GPT-4-turbo | $0.01 | $0.03 | 균형잡힌 선택 |
| GPT-4-Vision | $0.01 | $0.03 | + 이미지 비용 |
| text-embedding-ada-002 | $0.0001 | - | 임베딩용 |
| DALL-E 3 | - | $0.04~$0.12 | 이미지당 |

## 💡 주요 개념

### MCP (Model Context Protocol)

모델과 애플리케이션 간의 상호작용을 표준화하는 프로토콜입니다.

**핵심 구성 요소**:
- **구조화된 프롬프트 관리**: 시스템/사용자/어시스턴트 역할 구분
- **컨텍스트 윈도우 최적화**: 토큰 제한 내에서 효율적인 정보 관리
- **함수 호출 인터페이스**: 구조화된 데이터 처리
- **스트리밍 응답 처리**: 실시간 데이터 전송

### 주요 파라미터 설명

| 파라미터 | 설명 | 범위 | 권장값 | 용도 |
|---------|------|------|--------|------|
| `temperature` | 창의성/무작위성 조절 | 0.0 ~ 2.0 | 0.7 | 0: 결정적, 1: 균형, 2: 창의적 |
| `max_tokens` | 최대 출력 토큰 수 | 1 ~ 4096 | 1000 | 응답 길이 제한 |
| `top_p` | 누적 확률 임계값 | 0.0 ~ 1.0 | 0.9 | 토큰 선택 다양성 |
| `frequency_penalty` | 반복 억제 | -2.0 ~ 2.0 | 0.0 | 같은 단어 반복 방지 |
| `presence_penalty` | 새로운 주제 유도 | -2.0 ~ 2.0 | 0.0 | 다양한 주제 탐색 |

### 토큰 이해하기

**토큰이란?**
- AI 모델이 처리하는 텍스트의 기본 단위
- 단어, 부분 단어, 구두점 등을 포함

**토큰 수 계산**:
- 영어: 1 토큰 ≈ 4자
- 한글: 1 토큰 ≈ 2-3자
- 일반적: 1,000 토큰 ≈ 750 단어

**비용 계산 예시**:
```
입력: 500 토큰, 출력: 300 토큰 (GPT-3.5-turbo)
비용: (500 × $0.001) + (300 × $0.002) = $0.0005 + $0.0006 = $0.0011
```

## 🐛 문제 해결

### 일반적인 오류와 해결 방법

#### 1. API 키 관련 오류

**오류 메시지**: `Error: Invalid API Key`
**원인**: API 키가 잘못되었거나 설정되지 않음

**해결 방법**:
```bash
# 1. .env 파일 확인
cat .env

# 2. API 키 형식 확인 (sk-로 시작해야 함)
echo $OPENAI_API_KEY

# 3. 키 앞뒤 공백 제거
# .env 파일에서: OPENAI_API_KEY=sk-your-key-here
```

#### 2. 속도 제한 (Rate Limit)

**오류 메시지**: `Error: Rate limit exceeded`
**원인**: API 호출 빈도가 너무 높음

**해결 방법**:
```javascript
// API 호출 간 딜레이 추가
await new Promise(resolve => setTimeout(resolve, 1000));

// 지수 백오프 구현
const delay = Math.min(1000 * Math.pow(2, retryCount), 60000);
```

#### 3. 토큰 제한 초과

**오류 메시지**: `Error: Maximum context length exceeded`
**원인**: 입력 텍스트가 모델의 최대 토큰 제한을 초과

**해결 방법**:
```javascript
// max_tokens 값 줄이기
max_tokens: 500,  // 기본값에서 줄이기

// 대화 히스토리 트리밍
messages.slice(-10);  // 최근 10개 메시지만 유지

// 텍스트 청크 분할
const chunks = text.match(/.{1,4000}/g);
```

#### 4. 모델 접근 권한

**오류 메시지**: `Error: Model not found`
**원인**: 사용하려는 모델에 접근 권한이 없음

**해결 방법**:
- GPT-4: [대기 리스트](https://openai.com/waitlist/gpt-4-api) 신청
- GPT-4-Vision: 별도 접근 권한 필요
- 대체 모델 사용: `gpt-3.5-turbo`

#### 5. 네트워크 오류

**오류 메시지**: `Error: Network Error`
**원인**: 인터넷 연결 문제 또는 OpenAI 서버 문제

**해결 방법**:
```javascript
// 재시도 로직 구현
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

## ⚡ 성능 최적화

### 1. 토큰 최적화

**프롬프트 최적화**:
```javascript
// ❌ 비효율적
const prompt = `
이것은 매우 긴 프롬프트입니다.
불필요한 공백과 줄바꿈이 많습니다.
`;

// ✅ 효율적
const prompt = "간결하고 명확한 지시사항";
```

**시스템 메시지 재사용**:
```javascript
// 시스템 메시지를 한 번만 정의
const systemMessage = { role: 'system', content: '당신은 도움이 되는 AI입니다.' };

// 여러 요청에서 재사용
messages: [systemMessage, { role: 'user', content: userInput }]
```

### 2. 비용 절감

**개발 단계 최적화**:
```javascript
// 개발 시에는 GPT-3.5 사용
model: process.env.NODE_ENV === 'production' ? 'gpt-4' : 'gpt-3.5-turbo'

// 캐싱 구현
const cache = new Map();
if (cache.has(key)) return cache.get(key);
```

**배치 처리**:
```javascript
// 여러 요청을 한 번에 처리
const responses = await Promise.all(
  requests.map(req => openai.chat.completions.create(req))
);
```

### 3. 응답 품질 향상

**Few-shot 예제 제공**:
```javascript
const messages = [
  { role: 'system', content: '다음 예제를 참고하세요:' },
  { role: 'user', content: '예제 입력' },
  { role: 'assistant', content: '예제 출력' },
  { role: 'user', content: '실제 질문' }
];
```

**명확한 지시사항**:
```javascript
// ❌ 모호한 지시사항
"좋은 답변을 해주세요"

// ✅ 구체적인 지시사항
"다음 형식으로 JSON 응답을 제공하세요: {name: string, age: number}"
```

## 📖 추가 학습 자료

### 공식 문서
- [OpenAI API 문서](https://platform.openai.com/docs)
- [프롬프트 엔지니어링 가이드](https://platform.openai.com/docs/guides/prompt-engineering)
- [모범 사례](https://platform.openai.com/docs/guides/best-practices)
- [요금 계산기](https://openai.com/pricing)

### 학습 리소스
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [GPT-4 기술 보고서](https://arxiv.org/abs/2303.08774)
- [프롬프트 엔지니어링 연구](https://arxiv.org/abs/2107.13586)

### 커뮤니티
- [OpenAI Discord](https://discord.gg/openai)
- [Reddit r/OpenAI](https://www.reddit.com/r/OpenAI/)
- [Stack Overflow OpenAI 태그](https://stackoverflow.com/questions/tagged/openai)

## 🤝 기여하기

이 프로젝트는 학습 목적으로 만들어졌습니다. 개선 사항이나 새로운 예제 아이디어가 있다면 기여해주세요!

### 기여 방법

1. **이슈 리포트**: 버그 발견 시 [Issues](https://github.com/your-repo/issues)에 등록
2. **기능 제안**: 새로운 예제 아이디어나 개선사항 제안
3. **코드 기여**: Pull Request를 통한 코드 개선
4. **문서 개선**: README나 주석 개선

### 개발 가이드라인

- 코드 스타일: ESLint 규칙 준수
- 주석: 한글로 상세한 설명 추가
- 테스트: 새로운 기능에 대한 테스트 코드 작성
- 문서: README 업데이트

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## ⚠️ 주의사항

- 이 예제들은 **교육 목적**으로 작성되었습니다
- 프로덕션 환경에서는 추가적인 보안, 오류 처리, 최적화가 필요합니다
- API 키는 절대 공개 저장소에 커밋하지 마세요
- OpenAI API 사용 시 요금이 발생할 수 있습니다

## 📞 지원

문제가 있거나 질문이 있다면:
- [Issues](https://github.com/your-repo/issues)에 등록
- 이메일: your-email@example.com
- 문서: [Wiki](https://github.com/your-repo/wiki)

---

**마지막 업데이트**: 2024년 12월

**버전**: 1.0.0

**OpenAI API 버전**: 2024년 12월 기준 최신
