# 課堂異動紀錄 Dialog 設計

**日期：** 2026-03-10

**目標**

把現有的 `課堂詳情 dialog` 升級成可追溯、可掃讀的「課堂異動時間線」，讓教務能在同一個視窗內看懂這堂課被誰、在什麼時候、做了什麼異動。

## 1. 入口與整體定位

- 不新增第二層 dialog。
- 直接升級現有 [`apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.ts`](/Users/mizokhuangmbp2023/Desktop/Workspace/clessia/apps/web/src/app/features/admin/pages/sessions/dialogs/session-detail-dialog/session-detail-dialog.component.ts)。
- `課堂詳情 dialog` 仍是唯一入口。
- 異動紀錄不再只是附屬區塊，而是下半部主內容。

這個設計優先解決「單堂課追溯」而不是「全系統稽核總表」，避免把操作流程做重。

## 2. 資訊架構

Dialog 分成上下兩區：

### 上區：課堂摘要

固定顯示：

- 日期時間
- 課程
- 班級
- 分校
- 老師 / 未指派
- 課堂狀態
- 是否有異動

目標是先快速回答「這是哪一堂課」。

### 下區：異動時間線

- 最新在上、最舊在下
- 每筆異動是一張 timeline card
- 每張卡片固定顯示：
  - 異動類型
  - 異動時間
  - 操作者
  - 前後差異
  - 原因
  - 操作來源（單堂 / 批次）

目標是明確回答「這堂課怎麼被改過」。

## 3. 異動卡片顯示規則

所有卡片都要能獨立回答：

- 誰做的
- 什麼時候做的
- 把什麼改成什麼

### 調課

顯示：

- `原日期 原時間 → 新日期 新時間`

### 代課

顯示：

- `原老師 → 代課老師`

若原本未指派，也要明確顯示：

- `未指派 → 某老師`

### 停課

顯示：

- `課堂狀態：已排課 → 已停課`

### 取消停課

顯示：

- `課堂狀態：已停課 → 已排課`

### 共通欄位

- 有原因才顯示原因
- 顯示操作者姓名與建立時間
- 顯示 `單堂操作` 或 `批次操作`

## 4. 資料層設計

現有 `/api/sessions/:id/changes` 已有：

- `change_type`
- `original_session_date`
- `original_start_time`
- `original_end_time`
- `new_session_date`
- `new_start_time`
- `new_end_time`
- `substitute_teacher_id`
- `substitute_teacher_name`
- `reason`
- `created_by_name`
- `created_at`

但若要完整支援這次 dialog，還缺：

- `original_teacher_id`
- `original_teacher_name`
- `operation_source`

### 建議欄位

`schedule_changes` 新增：

- `original_teacher_id uuid null`
- `original_teacher_name text null`
- `operation_source text not null default 'single'`

`operation_source` 第一版只需要兩個值：

- `single`
- `batch`

### 寫入規則

- `單堂代課`：寫入原老師與新老師
- `單堂調課`：寫入 `operation_source = 'single'`
- `單堂停課`：寫入 `operation_source = 'single'`
- `單堂取消停課`：寫入 `operation_source = 'single'`
- `批次停課 / 批次取消停課 / 批次改時間`：統一寫入 `operation_source = 'batch'`

## 5. API 設計

不新增新 API。

沿用：

- `GET /api/sessions/:id/changes`

但回傳欄位補上：

- `originalTeacherId`
- `originalTeacherName`
- `operationSource`

前端 `ScheduleChange` interface 同步擴充。

## 6. UI / UX 原則

- 不做 dialog 裡再開 dialog
- 時間線卡片優先閱讀效率，不追求表格式密集呈現
- 空狀態要明確，不留空白
- 載入失敗要顯示錯誤訊息，不 silent fail

### 空狀態

顯示：

- `尚無異動紀錄`
- `此課堂自建立後未曾調課、停課、代課或恢復停課`

### 錯誤狀態

顯示：

- `異動紀錄載入失敗`

可附一個重新載入按鈕，但不是第一版必須。

## 7. 測試策略

### 前端

新增或補強：

- `session-detail-dialog.component.spec.ts`

至少覆蓋：

- 有異動紀錄時可渲染時間線
- `調課 / 代課 / 停課 / 取消停課` 的文案正確
- 可顯示 `原老師 → 代課老師`
- 可顯示 `單堂操作 / 批次操作`
- 空狀態正確
- 載入失敗狀態正確

### 後端

至少覆蓋：

- `GET /api/sessions/:id/changes` 會回傳新增欄位
- 單堂代課會寫入 `original_teacher_*`
- 批次停課 / 批次取消停課 / 批次改時間會寫入 `operation_source = 'batch'`

## 8. 實作順序

1. 補 migration 與型別
2. 補單堂 / 批次異動寫入欄位
3. 擴充 `getChanges` 回傳欄位
4. 重構 `session-detail-dialog` 為摘要 + 時間線
5. 補前後端測試

## 9. 不做的事

這一輪不做：

- 全域課堂稽核頁
- 可搜尋的跨課堂異動總表
- 第二層專用異動 dialog
- 額外 audit API
