# Project Master Document

## AI 경리비서 SaaS 프로젝트

- 문서 상태: 현재 개발 기준 문서
- 최신 기준: 2026-07
- 저장소: `jddnlover-png/ai-accounting-assistant`
- 기본 브랜치: `main`

---

# 1. 문서 목적

이 문서는 AI 경리비서 SaaS 프로젝트의 다음 기준을 통합 관리한다.

- 프로젝트 비전
- 제품 방향
- 플랫폼 아키텍처
- 핵심 설계 결정
- 실제 개발 완료 상태
- 미개발 범위
- 최신 개발 순서
- 과거 설계에서 변경된 사항

프로젝트 구현과 설계 판단은 이 문서의 **최신 결정**을 우선한다.

과거 결정과 최신 결정이 충돌할 경우 최신 결정이 현재 개발 기준이다.

---

# 2. 프로젝트 비전

최종 목표는 대표자가 모바일 또는 PC에서 음성이나 텍스트로 경리 업무를 처리할 수 있는 SaaS를 만드는 것이다.

```text
대표가 모바일 또는 PC에서 지시

↓

음성 또는 텍스트 입력

↓

AI가 명령을 분석

↓

거래 업무 처리

- 거래명세표
- 견적서
- 납품서
- 출고증
- 인수증
- 발주서

↓

매출 및 매입 관리

↓

입금 및 지급 처리

↓

미수금 및 미지급금 계산

↓

사용자 검토

↓

PDF 또는 Excel 생성

↓

메일 및 메시지 전송

↓

AI 경리비서 SaaS

모든 기능과 UI는 다음 두 흐름을 함께 고려한다.

1. 외근·현장:
   모바일 음성 입력으로 거래 작성 및 발행

2. 사무실:
   PC에서 직접 입력하고 검토 및 발행

프로젝트의 최우선 핵심 목적은 대표자가 핸드폰에서 음성으로 거래명세표와 경리 업무를 처리할 수 있게 만드는 것이다.

3. 기술 스택

현재 기술 스택:

Frontend
- React
- TypeScript
- Vite

Backend
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

Development
- VS Code
- Codex
- npm

Source Control
- Git
- GitHub

기본 명령:

npm run dev
npm run build

현재 저장소:

https://github.com/jddnlover-png/ai-accounting-assistant
4. 최신 Platform Architecture

현재 프로젝트는 단일 페이지 집합이 아니라 여러 플랫폼이 연결되는 구조로 개발한다.

AI Platform
│
├ Transaction Platform
│  ├ 거래명세표
│  ├ 입금관리
│  ├ 매입관리 예정
│  └ 지급관리 예정
│
├ Report Data Engine
│  ├ 거래 데이터 집계
│  ├ 입금 데이터 집계
│  ├ 미수금 계산
│  ├ 거래처 잔액 계산
│  └ 향후 매입·미지급금 계산
│
├ Report Builder Platform
│  ├ 기본 보고서
│  ├ 내 보고서
│  └ 프리미엄 보고서
│
├ Document Platform
│
├ PDF Platform
│
├ Master Data Platform
│
├ Storage Platform
│
└ 향후 Premium Inventory Platform
5. Ledger Platform 최신 정의

과거 설계에서는 다음 원장들을 각각 독립 메뉴와 페이지로 개발하는 방향을 검토했다.

미수금원장
미지급금원장
거래처원장
매출원장
매입원장

최신 설계에서는 이를 다음과 같이 재정의한다.

Ledger Platform
=
원장과 보고서에 필요한 계산·집계 데이터 엔진

Report Builder Platform
=
사용자가 보고서를 만들고 조회하는 화면

따라서 사용자 화면에서는 다음 구조를 사용한다.

보고서 관리

├ 기본 보고서
├ 내 보고서
└ 프리미엄 보고서

다음 보고서를 각각 별도의 고정 페이지로 중복 개발하지 않는다.

미수금원장
거래처원장
매출 보고서
입금 보고서

이 보고서들은 Report Builder의 기본 템플릿과 결과물로 제공한다.

원장별 독립 페이지를 다시 개발하려면 PMD의 최신 설계를 먼저 변경해야 한다.

6. Report Builder Platform
6.1 목적

회사마다 필요한 원장과 보고서 형식이 다르다.

개발자가 고정된 보고서만 제공하는 방식으로는 다음 요구를 모두 충족하기 어렵다.

회사별 다른 컬럼
회사별 다른 컬럼 순서
회사별 다른 컬럼 폭
회사별 다른 조회조건
회사별 다른 정렬
회사별 다른 디자인
회사별 다른 하단 문구

따라서 사용자가 직접 보고서를 만들고 저장하는 플랫폼을 핵심 경쟁력으로 개발한다.

6.2 보고서 관리 화면 구조
보고서 관리

├ 기본 보고서
├ 내 보고서
└ 프리미엄 보고서
기본 보고서
미수금원장
거래처원장
매출 보고서
입금 보고서

기본 목적:

거래처별 받을 돈 확인
거래와 입금 흐름 확인
매출 확인
입금 확인
프리미엄 보고서
품목 판매 분석
재고 현황
입출고 원장
재고 평가 보고서
부족 재고 보고서
창고별 재고 보고서
원가 분석
마진 분석

정책:

품목 판매 분석은 기본 무료 보고서에서 제외한다.

재고관리와 품목 분석은
Premium Inventory Platform과 연결되는
유료 확장 기능으로 제공한다.
6.3 Report Builder 핵심 기능

계획 및 구현 대상:

보고서 직접 생성
보고서 이름 입력
보고서 목적 선택
기본 템플릿 복사해서 만들기
컬럼 선택
컬럼 표시 및 숨김
컬럼 순서 변경
컬럼 폭 설정
조회기간 저장
거래처 필터 저장
상태 필터 저장
정렬 저장
글자 크기 설정
테두리 설정
테마 설정
하단 문구 설정
즐겨찾기
공유 범위
권한
PDF 출력
Excel 다운로드
7. PDF Platform 재사용 원칙

Report Builder는 기존 PDF Platform의 검증된 구조를 확장한다.

기존 구조:

PdfDocumentType
PdfPrintSettings
DEFAULT_PDF_PRINT_SETTINGS
DEFAULT_PDF_PRINT_SETTING_PROFILES

Report Builder 구조:

ReportType
ReportSettings
DEFAULT_REPORT_SETTINGS
DEFAULT_REPORT_SETTING_PROFILES

공통 개념:

type
profile
visibility
columnWidth
typography
border
theme
footer

보고서 전용 확장:

columns
filter
sort
purpose
permission
favorite
category

PDF Platform을 Report Builder 개발을 이유로 다시 작성하지 않는다.

8. PDF Platform 상태
완료된 기능
거래명세표 PDF 생성
A4 2단 공급자·수요자 구성
회사정보 표시
로고 표시
직인 표시
문서 유형별 Profile
실시간 Preview
설정 저장
새로고침 후 설정 유지
다운로드 PDF에 동일 설정 반영
컬럼 표시 설정
컬럼 폭 설정
글자 크기
선과 테두리
테마
하단 메모

지원 문서 유형:

거래명세표
납품서
출고증
인수증
견적서
발주서
직접 입력

현재 Profile 구조에서 문서 유형별 기본 설정을 처리할 수 있으므로 별도의 Document Engine 재개발은 하지 않는다.

PDF 하단 메모 오류 해결

발생했던 문제:

한글 입력 시 자음만 입력됨
한 글자 입력 후 focus가 사라짐

원인:

컴포넌트 재생성
상태 변경
IME 조합 충돌
focus 초기화

해결 상태:

한글 입력 정상
여러 줄 입력 정상
커서 유지 정상
Preview 반영 정상

Report Builder 설정 화면에서도 동일한 회귀를 방지해야 한다.

9. 회사정보 Platform

완료된 주요 항목:

상호
대표자
사업자번호
업태
종목
주소
전화
휴대폰
팩스
이메일
로고
직인

주요 DB 필드:

representative_name
business_number
business_type
business_item
address
phone
mobile_phone
fax
email
logo_url
stamp_url

Storage 연결 완료:

로고 업로드
직인 업로드
이미지 삭제
재업로드
미리보기
캐시 문제 해결

회사정보는 PDF와 향후 보고서 출력에서 재사용한다.

10. Transaction Platform
10.1 거래명세표

완료된 주요 기능:

생성
조회
수정
삭제
복사
상세보기
거래처 검색
품목 자동완성
품목 간편등록
기본 2행
Enter 새 행
수량·단가 전체 선택
이번 달 기본 기간
세금계산서 발행 상태
PDF 출력
10.2 입금관리

입금관리 대규모 리팩토링 완료.

현재 파일 구조:

src/pages/Payments.tsx

입금관리 분리 컴포넌트
├ paymentTypes.ts
├ paymentUtils.ts
├ PaymentCustomerSection.tsx
├ MessagePaymentSection.tsx
├ ManualPaymentSection.tsx
└ PaymentHistoryList.tsx

완료된 기능:

거래처 기준 입금
미수 거래 조회
여러 거래 선택
오래된 거래순 자동 배분
payments 저장
payment_allocations 저장
문자·카카오톡 입금 파싱
입금자 및 금액 후보 매칭
수기 입금
입금내역 조회
입금 삭제
삭제 후 미수 복구

Report Builder 작업으로 입금관리 계산과 배분 구조를 변경하지 않는다.

11. Master Data Platform

현재 기준정보:

거래처 관리
품목 관리
회사 설정

직원 계정 정책:

현재 실제 운영 계정은 대표 계정과 관리자 계정 중심이다.
직원 계정 기능은 현재 우선순위가 아니다.

미수금 메뉴는 과거 사이드바에 존재했지만, 고정 미수금 페이지 개발은 Report Builder 설계로 대체한다.

12. Sidebar와 메뉴 구조

과거 ERP형 그룹 구조:

등록 관리
원장 관리
기준정보
AI 자동화

최신 사용자 화면 방향:

대시보드

등록 관리
├ 거래명세표
├ 입금관리
├ 매입관리 예정
└ 지급관리 예정

보고서 관리
├ 기본 보고서
├ 내 보고서
└ 프리미엄 보고서

기준정보
├ 거래처 관리
├ 품목 관리
└ 회사 설정

AI 자동화 예정
├ 음성 입력
├ OCR 등록
└ AI 업무 처리

과거의 원장 관리 메뉴는 사용자 화면에서 보고서 관리 중심으로 흡수한다.

Ledger 개념은 데이터 엔진으로 유지한다.

13. Report Builder 현재 구현 상태

현재 생성된 주요 파일:

src/types/reportSettings.ts

src/components/reports/ReportPreview.tsx

src/components/reports/ReportBuilderModal.tsx

src/pages/Reports.tsx

현재 구현 완료:

ReportType
ReportPurpose
ReportCategory
ReportSettings
Report Profile
기본 보고서 타입
프리미엄 보고서 타입
보고서별 기본 컬럼
보고서별 기본 정렬
ReportPreview
보고서 종류별 샘플 데이터
ReportBuilderModal
보고서 이름
보고서 종류 선택
즐겨찾기
표시 설정
조회기간
컬럼 표시·숨김
컬럼 순서
컬럼 폭
글자 크기
테마
테두리
하단 문구
실시간 Preview
Preview 자동 축소
설정 패널 독립 스크롤
설정 변경 시 스크롤 위치 유지
기본값 복원
기본 템플릿 복사해서 만들기
내 보고서 카드
보고서 설정 수정
보고서 삭제
즐겨찾기 등록 및 해제

빌드 상태:

npm run build 성공

현재 Vite 번들 크기 경고가 있지만 빌드 오류는 아니다.

14. Report Builder 현재 제한

현재 내 보고서는 React state에만 저장한다.

따라서 다음 현상이 발생한다.

보고서 저장
→ 현재 Reports 화면에서는 표시

다른 메뉴 이동
→ Reports 컴포넌트가 언마운트
→ 저장 목록 초기화

새로고침
→ 저장 목록 초기화

현재 단계에서는 예상된 동작이며 다음 DB 연결 단계에서 해결한다.

아직 미완료:

report_templates 테이블
Supabase 영구 저장
내 보고서 조회
보고서 수정 영구 반영
보고서 삭제 영구 반영
즐겨찾기 영구 저장
organization_id 기반 분리
created_by 저장
공유 범위 및 권한
실제 Report Data Engine
PDF 출력
Excel 다운로드
15. report_templates 예정 DB 구조

예정 테이블:

report_templates

예정 컬럼:

id
organization_id
name
report_type
purpose
settings jsonb
is_favorite
visibility_scope
created_by
created_at
updated_at

settings jsonb 예정 내용:

report
profile
category
columns
visibility
columnWidth
filter
sort
typography
border
theme
footer
permission

DB 설계 시 반드시 검토할 사항:

UUID 기본값
organization_id foreign key
created_by foreign key
updated_at 자동 갱신
이름 길이 제한
report_type 검증
visibility_scope 검증
settings 기본값
RLS
조직별 조회 차단
생성자 또는 조직 권한
JSONB 구조 버전 관리

SQL은 사용자 확인 전 실행하지 않는다.

16. Supabase 보안 원칙

신규 보고서 테이블은 반드시 RLS를 검토한다.

핵심 원칙:

로그인 사용자만 접근
현재 조직 데이터만 조회
현재 조직에만 보고서 생성
다른 조직 데이터 수정·삭제 차단
Service Role Key를 브라우저에서 사용하지 않음

권한 구조는 현재 조직 및 인증 Context의 실제 구현을 먼저 확인한 후 작성한다.

17. 향후 Report Data Engine

Report Builder UI와 실제 데이터 계산 엔진은 구분한다.

Report Builder
=
보고서 정의와 사용자 화면

Report Data Engine
=
실제 거래·입금·미수금 데이터 조회와 계산

예정 데이터 소스:

거래명세표 및 거래 데이터
입금 데이터
payment_allocations
거래처 데이터
품목 데이터
회사정보
향후 매입 및 지급 데이터

기본 보고서 목적:

미수금원장
거래처별 총 매출
입금액
미수잔액
최근 거래일
상태
거래처원장
일자
거래 구분
거래 내용
매출
입금
누적 잔액
비고
매출 보고서
기간별 거래
공급가액
세액
합계액
세금계산서 상태
거래처
입금 보고서
입금일
거래처
입금방법
입금자
입금액
배분액
미배분액
비고
18. Premium Inventory Platform

Inventory Platform은 기본 기능과 분리된 유료 확장 상품으로 설계한다.

예정 범위:

현재고
입고
출고
재고조정
창고
안전재고
재고 평가
원가
마진
부족 재고

Premium 보고서와 연결한다.

기본 품목 보고서는 재고 기능과 혼동하지 않는다.

품목 판매 분석은 판매수량과 판매금액 분석이 목적이며, 실제 현재고 계산과는 분리한다.

19. OCR 및 AI Platform

향후 목표:

사진 업로드
PDF 업로드

↓

OCR

↓

AI 분석

↓

매입 거래 또는 문서 자동 작성

↓

사용자 검토

↓

저장

음성 목표:

대표가 모바일에서 음성 지시

↓

AI가 거래처, 품목, 수량, 단가, 날짜를 해석

↓

거래명세표 초안 생성

↓

사용자 확인

↓

저장 및 발행

OCR 및 음성 기능은 Report Builder DB 연결보다 뒤 순서다.

20. 최신 개발 순서

현재 기준 개발 순서:

STEP 1
Report Builder UI 최종 수동 검증

STEP 2
report_templates SQL 설계

STEP 3
사용자 승인 후 Supabase SQL Editor에서 실행

STEP 4
실행 결과 및 RLS 확인

STEP 5
TypeScript DB 타입과 데이터 접근 구조 준비

STEP 6
내 보고서 저장 및 조회 연결

STEP 7
보고서 수정 및 삭제 연결

STEP 8
즐겨찾기 영구 저장

STEP 9
organization_id 기반 회사별 데이터 분리 검증

STEP 10
공유 범위 및 권한

STEP 11
Report Data Engine 연결

STEP 12
기본 보고서 실제 데이터 연결

STEP 13
PDF 출력 연결

STEP 14
Excel 다운로드 연결

STEP 15
Premium Inventory Platform 개발

STEP 16
OCR

STEP 17
AI 음성 입력

현재 순서를 변경하려면 이유와 영향 범위를 먼저 검토한다.

21. 개발 완료 및 진행 상태
완료 또는 안정화 단계
회사정보 Platform
Storage Platform
거래처 관리
품목 관리
거래명세표 CRUD
입금관리 리팩토링
PDF Platform
PDF 실시간 Preview
GitHub 연결
Report Builder 기본 UI
진행 중
Report Builder Platform
미개발 또는 계획 단계
report_templates DB
Report Data Engine
PDF 보고서 출력
Excel 보고서 다운로드
매입관리
지급관리
미지급금 데이터 엔진
Inventory Platform
OCR
AI 음성 입력
AI 업무 자동화
22. 핵심 설계 결정

다음 결정은 현재 개발 기준이다.

1. Report Builder Platform을 핵심 플랫폼으로 개발한다.

2. Ledger Platform은 사용자 메뉴가 아니라 Report Data Engine으로 정의한다.

3. 기본 원장과 보고서는 Report Builder 결과물로 제공한다.

4. PDF Platform의 Type/Profile/Settings/Preview 구조를 재사용한다.

5. 품목 판매 분석과 재고 기능은 프리미엄 범위로 분리한다.

6. Inventory Platform은 유료 확장 상품이다.

7. 회사별 보고서 템플릿을 여러 개 저장할 수 있어야 한다.

8. organization_id를 기준으로 회사 데이터를 분리한다.

9. DB 변경 전 SQL과 RLS를 먼저 검토한다.

10. 기존 안정 기능을 Report Builder 개발 과정에서 깨뜨리지 않는다.
23. Development Log
2026-07
PDF Platform 최종 검증 완료

PDF 하단 메모 IME 오류 수정

PDF textarea focus 문제 수정

Document Type/Profile 구조 검토 완료

추가 Document Engine 개발 불필요 결정

입금관리 대규모 리팩토링 완료

paymentTypes 분리

paymentUtils 분리

PaymentHistoryList 분리

ManualPaymentSection 분리

MessagePaymentSection 분리

PaymentCustomerSection 분리

GitHub 저장소 연결

ERP형 플랫폼 메뉴 구조 검토

Ledger Platform 설계

Ledger Platform을 Report Data Engine으로 재정의

Report Builder Platform을 핵심 플랫폼으로 승격

기본 보고서 범위 확정

프리미엄 보고서 범위 확정

Inventory Platform 유료 확장 결정

ReportSettings 타입 생성

ReportPreview 생성

ReportBuilderModal 생성

Reports 페이지 연결

기본 템플릿 복사 기능 구현

내 보고서 임시 저장 구현

보고서 수정·삭제 구현

즐겨찾기 구현

컬럼 설정 구현

실시간 Preview 자동 축소 구현

설정 패널 잘림 문제 수정

설정 입력 시 스크롤 상단 이동 문제 수정

Codex 로컬 프로젝트 연결

AGENTS.md 및 PMD 문서 체계 도입
24. 다음 시작 위치

현재 다음 개발 시작점:

Report Builder UI 최종 확인

↓

report_templates SQL 설계

↓

RLS 정책 설계

↓

사용자 승인 후 SQL 실행

SQL 실행 전에는 프론트엔드 DB 연결 코드를 먼저 작성하지 않는다.