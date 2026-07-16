# AI Accounting Assistant - AGENTS.md

## Purpose

이 문서는 AI Accounting Assistant 프로젝트에서 Codex가 반드시 따라야 하는 개발 규칙을 정의한다.

모든 작업은 본 문서를 우선적으로 따른다.

PMD.md는 프로젝트 설계 문서이며,
AGENTS.md는 개발 규칙 문서이다.

설계 변경은 PMD를 기준으로 판단한다.

---

# RULE 001

코드를 수정하기 전에 반드시 관련 파일 전체를 읽는다.

부분만 보고 수정하지 않는다.

관련 타입

관련 컴포넌트

관련 Hook

관련 Utility

관련 페이지

관련 DB 구조

까지 확인 후 작업한다.

---

# RULE 002

현재 프로젝트에 존재하지 않는 라이브러리를 임의로 추가하지 않는다.

예)

- shadcn/ui
- Material UI
- Ant Design
- Tailwind Component Library

등을 임의 도입하지 않는다.

프로젝트의 기존 구조를 우선 사용한다.

---

# RULE 003

기존 UI 디자인 시스템을 유지한다.

현재 프로젝트는

- 인라인 스타일
- 기존 공통 디자인
- PDF Platform 구조

를 기준으로 개발한다.

새로운 UI 스타일을 임의 도입하지 않는다.

---

# RULE 004

새 기능보다

기존 기능 보호를 우선한다.

기존 정상 동작 기능을 단순화하거나 제거하지 않는다.

회귀(Regression)를 항상 고려한다.

---

# RULE 005

작업 전

반드시 작업 계획을 먼저 제시한다.

사용자의 확인 없이

대규모 수정을 진행하지 않는다.

---

# RULE 006

관련 코드가 여러 파일에 분산되어 있다면

모든 관련 파일을 먼저 확인한다.

추측으로 수정하지 않는다.

---

# RULE 007

작업 완료 후 반드시 실행한다.

npm run build

빌드 오류가 없어야 한다.

---

# RULE 008

사용자의 승인 없이

다음 작업을 수행하지 않는다.

- Git Commit
- Git Push
- SQL 실행
- DB Schema 변경
- Migration 실행

반드시 사용자 확인 후 진행한다.

---

# RULE 009

Supabase 관련 원칙

.env

Secret Key

Service Role Key

API Key

민감한 정보를 출력하거나 수정하지 않는다.

---

# RULE 010

DB 변경 시

반드시 아래 순서를 따른다.

1. 변경 목적 설명

2. SQL 작성

3. 영향 범위 설명

4. 사용자 승인

5. SQL 실행

6. 프론트 수정

순서를 변경하지 않는다.

---

# RULE 011

Report Builder Platform은

현재 프로젝트의 최우선 개발 기능이다.

관련 파일

src/types/reportSettings.ts

src/components/reports/

src/pages/Reports.tsx

를 우선 기준으로 사용한다.

---

# RULE 012

PDF Platform과 동일한 구조를 최대한 재사용한다.

새로운 구조보다

기존 구조 확장을 우선한다.

예)

PdfSettings

↓

ReportSettings

PdfPreview

↓

ReportPreview

---

# RULE 013

프로젝트 구조를 임의 변경하지 않는다.

새 폴더 생성

파일 이동

파일 삭제

Export 구조 변경

등은

사용자 승인 후 진행한다.

---

# RULE 014

응답 형식

항상 아래 순서를 따른다.

1. 수정 파일

2. 수정 내용

3. 이유

4. 영향 범위

5. 테스트 방법

6. Build 결과

7. 남은 위험 요소

---

# RULE 015

오류가 발생하면

증상만 수정하지 않는다.

근본 원인을 찾는다.

임시 우회 코드를 만들지 않는다.

---

# RULE 016

모든 작업은

모바일 음성 입력

PC 직접 입력

두 흐름을 모두 고려한다.

AI Accounting Assistant의 최종 목표를 항상 유지한다.

---

# RULE 017

PMD.md를 항상 참고한다.

프로젝트 방향이 변경되었는지

개발 순서가 변경되었는지

확인 후 작업한다.

---

# RULE 018

CHANGELOG.md를 참고하여

최근 변경사항과 충돌 여부를 확인한다.

---

# RULE 019

큰 기능 개발 시

작업을 단계별로 나눈다.

예)

STEP 1

STEP 2

STEP 3

...

각 단계마다 Build를 수행한다.

---

# RULE 020

최우선 원칙

정확성 > 속도

안정성 > 기능 추가

기존 구조 유지 > 새로운 구조 도입

근거 없는 추측 금지

사용자 승인 없는 위험 작업 금지

프로젝트 전체 일관성 유지