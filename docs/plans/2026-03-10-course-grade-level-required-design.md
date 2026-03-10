# 課程學段改為必填設計

日期：2026-03-10

## 目標

將課程的 `學段 gradeLevels` 從選填改為必填，避免建立出無學段的課程資料。

## 設計決策

- 前端課程表單：
  - `學段` 欄位顯示必填星號
  - 未選學段時不可建立/儲存
  - 呼叫 `save()` 時也做防呆提示，避免只靠按鈕 disabled
- 前端型別：
  - `CreateCourseInput.gradeLevels` 改為必填
  - `UpdateCourseInput.gradeLevels` 保持 optional，但若傳入則必須至少 1 個
- 後端 API：
  - `POST /api/courses` 要求 `gradeLevels` 至少 1 個
  - `PUT /api/courses/:id` 若帶 `gradeLevels`，至少 1 個
- Seed：
  - `supabase/seed.sql` 生成 demo 課程時一併填入學段

## 不處理

- 舊正式資料的 migration 補值
- 課程學段枚舉重構

## 驗證

- 課程表單在空學段時不能送出
- API schema 不接受空陣列
- `supabase/seed.sql` 建出的課程都有學段
