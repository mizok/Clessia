# Session History Dialog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 升級課堂詳情 dialog，讓教務可在同一視窗查看完整課堂摘要與可追溯的異動時間線，包含原老師與批次來源。

**Architecture:** 延用現有 `session-detail-dialog` 與 `GET /api/sessions/:id/changes`，不新增新入口。後端先擴充 `schedule_changes` schema 與寫入欄位，再讓前端依新的 change view-model 重排為摘要區與時間線卡片。

**Tech Stack:** Angular 21 Standalone + Signals、PrimeNG、Hono OpenAPI、Supabase PostgreSQL、Vitest、Nx

---

### Task 1: 補 schedule_changes schema

**Files:**
- Create: `supabase/migrations/20260310150000_add_history_metadata_to_schedule_changes.sql`
- Modify: `apps/api/src/routes/sessions.ts`
- Test: `apps/api/src/routes/sessions.spec.ts` or existing route-adjacent tests if present

**Step 1: Write the failing migration-aware test**

- 先在 API 測試中建立一筆 `substitute` change，斷言 response 需要包含：
  - `originalTeacherName`
  - `operationSource`

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts
```

Expected:

- FAIL，原因是 response 尚未帶出新增欄位

**Step 3: Write minimal schema change**

在 migration 新增欄位：

```sql
ALTER TABLE public.schedule_changes
ADD COLUMN original_teacher_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
ADD COLUMN original_teacher_name text,
ADD COLUMN operation_source text NOT NULL DEFAULT 'single';

COMMENT ON COLUMN public.schedule_changes.original_teacher_id IS '代課前原任老師 staff id';
COMMENT ON COLUMN public.schedule_changes.original_teacher_name IS '代課前原任老師姓名快照';
COMMENT ON COLUMN public.schedule_changes.operation_source IS '操作來源：single 或 batch';
```

**Step 4: Update route mapping**

在 `mapSessionChange(...)` 與 `getChanges` select 補上：

- `original_teacher_id`
- `original_teacher_name`
- `operation_source`

**Step 5: Run test to verify it passes**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts
```

Expected:

- PASS

**Step 6: Commit**

```bash
git add supabase/migrations/20260310150000_add_history_metadata_to_schedule_changes.sql apps/api/src/routes/sessions.ts apps/api/src/routes/sessions.spec.ts
git commit -m "feat: add schedule change history metadata"
```

### Task 2: 補單堂異動寫入欄位

**Files:**
- Modify: `apps/api/src/routes/sessions.ts:cancel/substitute/reschedule/uncancel routes`
- Test: `apps/api/src/routes/sessions.spec.ts`

**Step 1: Write the failing test**

- 針對單堂 `substitute`：
  - 建立原本已有老師的 session
  - 呼叫 substitute
  - 斷言 schedule change 寫入 `original_teacher_name`
  - 斷言 `operation_source = 'single'`

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts -t substitute
```

Expected:

- FAIL，因為目前沒有寫入 `original_teacher_name`

**Step 3: Write minimal implementation**

- 在 `loadSessionOperationState(...)` 已有 `teacherId` / `teacherName` 的前提下
- `substitute` insert `schedule_changes` 時寫入：

```ts
original_teacher_id: sessionState.teacherId,
original_teacher_name: sessionState.teacherName,
operation_source: 'single',
```

- `cancel` / `reschedule` / `uncancel` 也統一寫入：

```ts
operation_source: 'single',
```

**Step 4: Run focused tests**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts -t substitute
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add apps/api/src/routes/sessions.ts apps/api/src/routes/sessions.spec.ts
git commit -m "feat: record single-session history metadata"
```

### Task 3: 補批次異動寫入來源

**Files:**
- Modify: `apps/api/src/routes/sessions.ts:batch-update-time/batch-cancel/batch-uncancel`
- Test: `apps/api/src/routes/sessions.spec.ts`

**Step 1: Write the failing test**

- 針對批次停課、批次取消停課、批次改時間各補一個斷言：
  - 寫入的 `schedule_changes.operation_source` 應為 `batch`

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts -t batch
```

Expected:

- FAIL，因為目前未寫入 `operation_source`

**Step 3: Write minimal implementation**

把三個批次 route 的 `schedule_changes.insert(...)` payload 補上：

```ts
operation_source: 'batch',
```

**Step 4: Run focused tests**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts -t batch
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add apps/api/src/routes/sessions.ts apps/api/src/routes/sessions.spec.ts
git commit -m "feat: mark batch session history changes"
```

### Task 4: 擴充前端 SessionsService 型別

**Files:**
- Modify: `apps/web/src/app/core/sessions.service.ts`
- Test: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts`

**Step 1: Write the failing test**

- 在 dialog spec 建一筆 change mock，使用：
  - `originalTeacherName`
  - `operationSource`

**Step 2: Run test to verify it fails**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
```

Expected:

- FAIL，因為 `ScheduleChange` 型別尚未支援新增欄位或 spec 尚不存在

**Step 3: Write minimal implementation**

在 `ScheduleChange` interface 增加：

```ts
originalTeacherId: string | null;
originalTeacherName: string | null;
operationSource: 'single' | 'batch';
```

**Step 4: Run test to verify it passes**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
```

Expected:

- 至少能成功編譯到下一個 UI assertion 階段

**Step 5: Commit**

```bash
git add apps/web/src/app/core/sessions.service.ts apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
git commit -m "feat: extend session change client model"
```

### Task 5: 重構課堂詳情 dialog 的摘要與時間線

**Files:**
- Modify: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.ts`
- Modify: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.html`
- Modify: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.scss`
- Test: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts`

**Step 1: Write the failing UI test**

補下列案例：

- 顯示 `課堂摘要`
- 有異動時顯示 timeline
- `調課` 顯示前後日期時間
- `代課` 顯示 `原老師 → 代課老師`
- `批次操作` 顯示來源文案
- 無異動時顯示空狀態

**Step 2: Run test to verify it fails**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
```

Expected:

- FAIL，因為 template 尚未重構

**Step 3: Write minimal implementation**

在 component 補純函式或 protected methods：

- `changeTypeLabel(changeType)`
- `changeSummary(change)`
- `changeReason(change)`
- `changeActorLabel(change)`
- `changeSourceLabel(change)`

template 改成：

- 上區摘要
- 下區 timeline cards
- 空狀態 / 載入 / 錯誤狀態

**Step 4: Run focused test**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.ts apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.html apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.scss apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
git commit -m "feat: redesign session detail history timeline"
```

### Task 6: 補錯誤與空狀態

**Files:**
- Modify: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.ts`
- Modify: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.html`
- Test: `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts`

**Step 1: Write the failing test**

- `getChanges` 失敗時應顯示 `異動紀錄載入失敗`
- 無資料時應顯示：
  - `尚無異動紀錄`
  - `此課堂自建立後未曾調課、停課、代課或恢復停課`

**Step 2: Run test to verify it fails**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
```

Expected:

- FAIL

**Step 3: Write minimal implementation**

- component 增加 `loadError` signal
- API error 時設為 `true`
- template 顯示明確錯誤區塊與空狀態文案

**Step 4: Run focused test**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.ts apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.html apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
git commit -m "feat: add session history empty and error states"
```

### Task 7: 全量驗證

**Files:**
- Modify: none
- Test:
  - `apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts`
  - `apps/web/src/app/features/admin/pages/sessions/sessions.page.spec.ts`
  - `apps/api/src/routes/sessions.spec.ts`
  - `apps/api/src/domain/session-assignment/batch-update-time-planner.spec.ts`

**Step 1: Run front-end tests**

Run:

```bash
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.spec.ts
npx nx test web --include=apps/web/src/app/features/admin/pages/sessions/sessions.page.spec.ts
```

Expected:

- PASS

**Step 2: Run back-end tests**

Run:

```bash
npx vitest run apps/api/src/routes/sessions.spec.ts apps/api/src/domain/session-assignment/batch-update-time-planner.spec.ts
```

Expected:

- PASS

**Step 3: Review working tree**

Run:

```bash
git status --short
git diff --stat
```

Expected:

- 只剩本次 dialog 相關變更

**Step 4: Commit**

```bash
git add supabase/migrations apps/api/src/routes/sessions.ts apps/api/src/routes/sessions.spec.ts apps/web/src/app/core/sessions.service.ts apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog
git commit -m "feat: add session history timeline dialog"
```
