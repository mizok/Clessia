# 教務管理板塊複測報告

日期：2026-03-10

對照報告：

- `docs/reviews/2026-03-09-academic-management-review.md`

## 複測範圍

本次複測只依據目前程式碼與現行路由，不參考 `PRD.md`。

檢查範圍：

- `/admin/courses`
- `/admin/classes`
- `/admin/calendar`
- `/admin/schedule`
- `/admin/sessions`
- `/admin/changes`

本次複測另套用一項產品前提：

- `停用班級` 的語意為「只處理未來課堂」
- `刪除班級` 是另一個獨立動作，不等於停用

## 複測結論

- 已修正：2 項
- 部分修正：2 項
- 未修正：2 項

## 項目結果

### 1. 班級既有時段可編輯但儲存不生效

**原問題**

- 編輯班級時可以修改既有時段，但儲存流程只會刪除與新增，不會更新既有時段。

**複測結果**

- 狀態：`已修正`

**依據**

- `apps/web/src/app/features/admin/pages/classes/class-form-dialog/class-form-dialog.component.ts:260`

**說明**

- 現在 `handleScheduleUpdates(...)` 已補上 `toUpdate` 邏輯。
- 對保留中的既有時段，會呼叫 `updateSchedule(...)`。

### 2. 班級刪除規則不一致

**原問題**

- 單筆刪除、批次刪除、按鈕 disabled 條件與後端刪除行為不一致。

**複測結果**

- 狀態：`部分修正，仍需確認`

**依據**

- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:348`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:538`
- `apps/api/src/routes/classes.ts:705`
- `apps/api/src/routes/classes.ts:1010`

**說明**

- 需先以目前產品前提重述此題：
  - `停用班級` 處理未來課堂，本身不是問題
  - 真正要確認的是 `刪除班級` 的規則是否已完全對齊
- 目前現況：
  - 單筆刪除按鈕仍以 `hasUpcomingSessions` 控制是否可按
  - 批次刪除會略過有未來課堂的班級
  - 後端單筆刪除 API 仍會 cascade delete `sessions / schedules / enrollments`

**判定**

- 此題不能再定義成「停用與刪除衝突」。
- 應改定義為：「刪除班級」的前端與後端語意仍未完全收斂。

### 3. 舊教務路由仍為死路

**原問題**

- `/admin/schedule`、`/admin/sessions`、`/admin/changes` 仍可進入，但頁面只是占位內容。

**複測結果**

- 狀態：`已修正`

**依據**

- `apps/web/src/app/app.routes.ts:135`
- `apps/web/src/app/app.routes.ts:139`
- `apps/web/src/app/app.routes.ts:175`

**說明**

- 以上三個路由已改為 redirect 到 `/admin/calendar`。
- 不再是原本的死路頁面。

### 4. 課程維護入口分裂

**原問題**

- `/admin/courses` 仍存在，但 menu 隱藏；`/admin/classes` 又可維護課程。

**複測結果**

- 狀態：`未修正`

**依據**

- `apps/web/src/app/app.routes.ts:168`
- `apps/web/src/app/app.routes.ts:203`
- `apps/web/src/app/core/smart-enums/routes-catalog.ts:105`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:576`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:595`

**說明**

- `/admin/courses` 仍是正式路由。
- `ADMIN_COURSES.showInMenu` 仍為 `false`。
- `/admin/classes` 仍內建新增/編輯/刪除課程入口。

**判定**

- 使用者心智模型尚未收斂。
- 仍需決定「課程主檔」到底保留在哪一頁。

### 5. 行事曆篩選 badge / 清除 / 實際條件不一致

**原問題**

- UI 有日期與分校等條件，但 badge 與清除邏輯沒有完整反映。

**複測結果**

- 狀態：`部分修正`

**依據**

- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:98`
- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:184`
- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:527`
- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:535`
- `apps/web/src/app/features/admin/pages/calendar/components/session-filters/session-filters.component.html:43`

**說明**

- 日期範圍現在已納入：
  - `activeFilterCount`
  - `hasActiveFilters`
  - `clearFilters()`
- 但分校仍然：
  - 出現在篩選 UI 中
  - 不計入 badge
  - 不會被 `clearFilters()` 清除

**判定**

- 比原本好，但尚未完全一致。
- 還需要決定「分校」在這個頁面中是上下文還是真正篩選條件。

### 6. `/admin/courses` 手機版大型資料集操作能力不足

**原問題**

- 手機版直接渲染全部卡片，沒有分頁或 load more。
- 也缺少狀態篩選。

**複測結果**

- 狀態：`未修正`

**依據**

- `apps/web/src/app/features/admin/pages/courses/courses.page.ts:124`
- `apps/web/src/app/features/admin/pages/courses/courses.page.html:31`
- `apps/web/src/app/features/admin/pages/courses/courses.page.html:121`
- `apps/web/src/app/features/admin/pages/courses/courses.page.html:214`

**說明**

- 桌機版仍有 paginator。
- 手機版仍是整批卡片直接輸出。
- 篩選器仍沒有狀態篩選。

## 本次新增觀察

### 「在行事曆查看」已改善日期帶入

**狀態**

- `已修正`

**依據**

- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:744`

**說明**

- 從 `課程管理` 點「在行事曆查看」時，現在會先查該班級的課堂，取第一堂與最後一堂日期，再帶 `from / to` 導向 `/admin/calendar`。
- 可避免一進行事曆就落在不合理的預設日期區間。

## 建議後續處理順序

1. 明確定義 `刪除班級` 的唯一規則，並同步前端與後端
2. 決定課程主檔入口只保留一套：`/admin/courses` 或 `/admin/classes`
3. 明確定義 `calendar` 中分校是否屬於篩選條件
4. 若 `courses` 頁面會保留，再補手機版分頁與狀態篩選

## 複測時執行的驗證

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/classes/class-form-dialog/class-form-dialog.component.spec.ts
npx nx test web --include=apps/web/src/app/features/admin/pages/calendar/calendar.page.spec.ts
npx nx test web --include=apps/web/src/app/features/admin/pages/classes/classes.page.spec.ts
```

以上測試在本次複測時皆通過。
