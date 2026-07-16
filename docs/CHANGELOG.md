# CHANGELOG

AI 경리비서 SaaS 프로젝트의 주요 설계 변경 및 개발 이력을 기록한다.

이 문서는 단순 작업일지가 아니라,
프로젝트 구조와 개발 방향이 변경된 중요한 결정을 기록한다.

---

# 2026-07

## Platform

### Report Builder Platform 승격

- Report Builder를 핵심 플랫폼으로 승격
- 사용자 정의 보고서 생성 구조 확정
- 기본 보고서 / 내 보고서 / 프리미엄 보고서 구조 확정

---

### Ledger Platform 재정의

기존

- 미수금원장
- 거래처원장
- 매출원장

각각 별도 페이지 개발

↓

변경

Ledger Platform

↓

Report Data Engine

↓

Report Builder 결과물 제공

---

### PDF Platform 완료

완료

- PDF 출력
- Profile 구조
- Document Type
- 실시간 Preview
- 설정 저장
- 새로고침 유지
- 하단 메모
- Typography
- Border
- Theme

---

### PDF Platform 재사용 결정

PdfSettings 구조를

↓

ReportSettings 구조로 확장

새로운 구조를 만들지 않음

---

### Transaction Platform

입금관리 리팩토링 완료

구조

Payments.tsx

↓

paymentTypes

paymentUtils

PaymentCustomerSection

ManualPaymentSection

MessagePaymentSection

PaymentHistoryList

---

### Report Builder

생성 완료

- ReportSettings
- ReportPreview
- ReportBuilderModal
- Reports
- 기본 Template
- Preview
- 즐겨찾기
- 내 보고서
- 컬럼 설정
- Preview 자동 축소

---

### Premium 정책 확정

품목 판매 분석

↓

Premium

재고관리

↓

Premium Inventory Platform

---

### 개발 정책

Codex 개발 문서 도입

- AGENTS.md
- PMD.md
- CHANGELOG.md

도입 완료

---

### Git 관리

GitHub 저장소 기준 확정

Repository

ai-accounting-assistant

Branch

main

---

## 현재 개발 단계

현재

Report Builder UI 완료

↓

다음 단계

report_templates DB

↓

Supabase CRUD

↓

Report Data Engine

↓

PDF 출력

↓

Excel 출력

↓

Inventory Platform

↓

OCR

↓

AI Voice