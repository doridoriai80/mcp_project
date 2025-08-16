# MCP (Model Context Protocol) 실습 예제

OpenAI API를 활용한 단계별 MCP 실습 예제 모음입니다. 초급부터 고급까지 다양한 수준의 예제를 통해 AI 애플리케이션 개발을 학습할 수 있습니다.

## 📋 목차

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

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- OpenAI API 키 ([OpenAI Platform](https://platform.openai.com)에서 발급)

### 설치

```bash
# 저장소 클론
git clone [repository-url]
cd mcp_project

# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
# .env 파일을 열어 OPENAI_API_KEY를 입력하세요
```

## 📁 프로젝트 구조

```
mcp_project/
├── examples/
│   ├── beginner/          # 초급 예제
│   │   ├── 01-text-generation.js
│   │   └── 02-chatbot.js
│   ├── intermediate/      # 중급 예제
│   │   ├── 01-function-calling.js
│   │   └── 02-streaming.js
│   └── advanced/          # 고급 예제
│       ├── 01-rag-system.js
│       └── 02-multimodal.js
├── package.json
├── env.example
└── README.md
```

## 📚 예제 소개

### 초급 예제

#### 1. 텍스트 생성 (01-text-generation.js)
**학습 목표**: OpenAI API의 기본 사용법과 텍스트 생성

- **주요 기능**:
  - 간단한 텍스트 완성
  - Temperature 파라미터 이해
  - 다양한 스타일로 텍스트 변환
  - 토큰 사용량 확인

- **핵심 개념**:
  - API 클라이언트 초기화
  - Chat Completions API 사용
  - 프롬프트 엔지니어링 기초
  - 파라미터 조정 (temperature, max_tokens)

```bash
npm run beginner-1
```

#### 2. 대화형 챗봇 (02-chatbot.js)
**학습 목표**: 대화 컨텍스트 관리와 인터랙티브 챗봇 구현

- **주요 기능**:
  - 실시간 대화 인터페이스
  - 대화 히스토리 관리
  - 컨텍스트 유지
  - 데모 모드와 대화형 모드

- **핵심 개념**:
  - 대화 히스토리 배열 관리
  - 시스템/사용자/어시스턴트 역할
  - 세션 관리
  - 토큰 최적화

```bash
npm run beginner-2
```

### 중급 예제

#### 1. 함수 호출 (01-function-calling.js)
**학습 목표**: Function Calling을 통한 구조화된 데이터 처리

- **주요 기능**:
  - 날씨 정보 조회
  - 할 일 목록 관리
  - 계산기 기능
  - 병렬 함수 호출

- **핵심 개념**:
  - 함수 스키마 정의
  - JSON 파라미터 파싱
  - 함수 실행 및 결과 반환
  - 구조화된 출력 생성

```bash
npm run intermediate-1
```

#### 2. 스트리밍 응답 (02-streaming.js)
**학습 목표**: 실시간 스트리밍 응답 처리

- **주요 기능**:
  - 기본 스트리밍
  - 프로그레스 표시
  - 멀티턴 스트리밍 대화
  - 스트리밍 중단 처리
  - JSON 모드 스트리밍

- **핵심 개념**:
  - 비동기 스트림 처리
  - 청크 단위 데이터 수신
  - 실시간 UI 업데이트
  - AbortController 사용

```bash
npm run intermediate-2
```

### 고급 예제

#### 1. RAG 시스템 (01-rag-system.js)
**학습 목표**: Retrieval-Augmented Generation 구현

- **주요 기능**:
  - 문서 임베딩 생성
  - 벡터 유사도 검색
  - 컨텍스트 기반 응답
  - RAG vs 일반 생성 비교
  - 대화형 RAG

- **핵심 개념**:
  - 텍스트 임베딩 (text-embedding-ada-002)
  - 코사인 유사도 계산
  - 청크 분할 전략
  - 벡터 데이터베이스 시뮬레이션
  - 컨텍스트 주입

```bash
npm run advanced-1
```

#### 2. 멀티모달 처리 (02-multimodal.js)
**학습 목표**: 이미지와 텍스트를 함께 처리하는 멀티모달 AI

- **주요 기능**:
  - 이미지 분석 및 설명
  - 여러 이미지 비교
  - 이미지 기반 Q&A
  - OCR 시뮬레이션
  - 접근성 텍스트 생성
  - 차트 데이터 추출

- **핵심 개념**:
  - GPT-4 Vision API
  - Base64 이미지 인코딩
  - 멀티모달 프롬프트 구성
  - DALL-E 이미지 생성
  - 실용적 비전 AI 활용

```bash
npm run advanced-2
```

## 🔧 실행 방법

### 개별 예제 실행

```bash
# 초급 예제
npm run beginner-1    # 텍스트 생성
npm run beginner-2    # 챗봇

# 중급 예제  
npm run intermediate-1    # 함수 호출
npm run intermediate-2    # 스트리밍

# 고급 예제
npm run advanced-1    # RAG 시스템
npm run advanced-2    # 멀티모달
```

### 직접 실행

```bash
node examples/beginner/01-text-generation.js
node examples/beginner/02-chatbot.js
# ... 등
```

## 🔑 API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 발급
2. `.env` 파일 생성 (env.example 참고)
3. API 키 입력:

```env
OPENAI_API_KEY=sk-...your-api-key...
```

### API 사용 요금

- **GPT-3.5-turbo**: $0.001 / 1K 토큰 (입력), $0.002 / 1K 토큰 (출력)
- **GPT-4**: $0.03 / 1K 토큰 (입력), $0.06 / 1K 토큰 (출력)
- **GPT-4-Vision**: $0.01 / 1K 토큰 + 이미지 비용
- **Embeddings**: $0.0001 / 1K 토큰
- **DALL-E 3**: $0.04 ~ $0.12 / 이미지

## 💡 주요 개념

### MCP (Model Context Protocol)
모델과 애플리케이션 간의 상호작용을 표준화하는 프로토콜로, 다음을 포함합니다:
- 구조화된 프롬프트 관리
- 컨텍스트 윈도우 최적화
- 함수 호출 인터페이스
- 스트리밍 응답 처리

### 주요 파라미터

| 파라미터 | 설명 | 범위 | 용도 |
|---------|------|------|------|
| temperature | 창의성/무작위성 조절 | 0.0 ~ 2.0 | 0: 결정적, 1: 균형, 2: 창의적 |
| max_tokens | 최대 출력 토큰 수 | 1 ~ 4096 | 응답 길이 제한 |
| top_p | 누적 확률 임계값 | 0.0 ~ 1.0 | 토큰 선택 다양성 |
| frequency_penalty | 반복 억제 | -2.0 ~ 2.0 | 같은 단어 반복 방지 |
| presence_penalty | 새로운 주제 유도 | -2.0 ~ 2.0 | 다양한 주제 탐색 |

### 토큰 이해하기
- 1 토큰 ≈ 4자 (영어)
- 1 토큰 ≈ 2-3자 (한글)
- 1,000 토큰 ≈ 750 단어

## 🐛 문제 해결

### 일반적인 오류와 해결 방법

#### 1. API 키 오류
```
Error: Invalid API Key
```
**해결**: `.env` 파일의 API 키 확인, 키 앞뒤 공백 제거

#### 2. 속도 제한 (Rate Limit)
```
Error: Rate limit exceeded
```
**해결**: 
- API 호출 간 딜레이 추가
- 더 높은 티어로 업그레이드
- 지수 백오프 구현

#### 3. 토큰 제한 초과
```
Error: Maximum context length exceeded
```
**해결**:
- max_tokens 값 줄이기
- 대화 히스토리 트리밍
- 텍스트 청크 분할

#### 4. 모델 접근 권한
```
Error: Model not found
```
**해결**:
- GPT-4: 대기 리스트 신청 필요
- GPT-4-Vision: 별도 접근 권한 필요
- 대체 모델 사용 (gpt-3.5-turbo)

### 성능 최적화 팁

1. **토큰 최적화**
   - 불필요한 공백/줄바꿈 제거
   - 간결한 프롬프트 작성
   - 시스템 메시지 재사용

2. **비용 절감**
   - 개발 시 GPT-3.5 사용
   - 캐싱 구현
   - 배치 처리 활용

3. **응답 품질 향상**
   - Few-shot 예제 제공
   - 명확한 지시사항
   - 적절한 temperature 설정

## 📖 추가 학습 자료

- [OpenAI API 문서](https://platform.openai.com/docs)
- [프롬프트 엔지니어링 가이드](https://platform.openai.com/docs/guides/prompt-engineering)
- [모범 사례](https://platform.openai.com/docs/guides/best-practices)
- [요금 계산기](https://openai.com/pricing)

## 🤝 기여하기

이 프로젝트는 학습 목적으로 만들어졌습니다. 개선 사항이나 새로운 예제 아이디어가 있다면 이슈나 PR을 통해 기여해주세요!

## 📄 라이선스

MIT License

---

**참고**: 이 예제들은 교육 목적으로 작성되었으며, 프로덕션 환경에서는 추가적인 오류 처리, 보안, 최적화가 필요합니다.
