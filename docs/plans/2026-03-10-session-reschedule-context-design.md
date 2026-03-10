# 調課對話框課況提示設計

日期：2026-03-10

## 目標

將調課對話框中的「當日已有幾堂課」提示，改為明確服務教務 / 排課行政的決策資訊，避免目前文案模糊不清。

## 設計決策

- 同一天查詢課堂後，拆成兩個視角：
  - `同分校當日已排 X 堂`
  - `同老師當日另有 X 堂`
- `同老師` 區塊只在原課堂已有指派老師時顯示
- 原本灰底 inline chip 改成每筆獨立斷行的 block item

## 範圍

- `session-reschedule-dialog.component.ts`
- `session-reschedule-dialog.component.html`
- `session-reschedule-dialog.component.scss`
- 新增 dialog spec

## 查詢策略

- 依新日期查同一天課堂
- 以前端切出：
  - 同分校課堂
  - 同老師課堂

## 驗證

- 文案明確顯示「同分校」與「同老師」
- 灰底項目每筆獨立斷行
- 未指派老師的課堂不顯示「同老師」區塊
