# 教務管理板塊 Review 報告

日期：2026-03-09

## 範圍

本報告只依據「現行路由可到達的頁面」與對應實作程式碼撰寫，不參考 `PRD.md`。

檢查範圍：

- `/admin/courses`
- `/admin/classes`
- `/admin/calendar`
- `/admin/schedule`
- `/admin/sessions`
- `/admin/changes`

主要依據：

- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/core/smart-enums/routes-catalog.ts`
- `apps/web/src/app/features/admin/pages/courses/**`
- `apps/web/src/app/features/admin/pages/classes/**`
- `apps/web/src/app/features/admin/pages/calendar/**`
- `apps/web/src/app/features/admin/pages/schedule/**`
- `apps/web/src/app/features/admin/pages/sessions/**`
- `apps/web/src/app/features/admin/pages/changes/**`

## Findings

### P0. 班級編輯畫面允許修改既有時段，但儲存時不會真正更新既有時段

**位置**

- `apps/web/src/app/features/admin/pages/classes/class-form-dialog/class-form-dialog.component.ts:71`
- `apps/web/src/app/features/admin/pages/classes/class-form-dialog/class-form-dialog.component.ts:260`
- `apps/web/src/app/features/admin/pages/classes/class-form-dialog/class-form-dialog.component.html:99`

**現象**

- 編輯班級時，既有 `schedules` 會被載入成可編輯表單資料。
- UI 允許修改星期、開始時間、結束時間。
- 儲存流程只會：
  - 刪除被移除的既有時段
  - 新增沒有 `id` 的新時段
- 對於「保留下來但值已修改」的既有時段，沒有任何 `updateSchedule(...)` 呼叫。

**影響**

- 使用者會誤以為已修改成功，但資料實際不變。
- 這是直接的資料一致性與信任問題。
- 教務人員可能重複操作、或誤判後續課堂生成結果。

**修正建議**

- 在 `handleScheduleUpdates(...)` 補上 `toUpdate` diff。
- 以 `id` 為基準比對既有時段與表單值，分成 `toDelete / toUpdate / toAdd`。
- 成功訊息要反映實際變更，例如「已更新 2 個時段、刪除 1 個時段、新增 1 個時段」。
- 補單元測試或整合測試覆蓋：
  - 只改時間
  - 只改星期
  - 同時改多筆既有時段

### P0. 班級刪除規則在單筆、批次、按鈕狀態三處互相衝突

**位置**

- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:347`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:537`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:798`

**現象**

- 操作選單中，單筆「刪除班級」只在 `hasUpcomingSessions` 時 disabled。
- 單筆刪除確認文案卻表示：若已有課堂或時段設定，會連同課堂、出席紀錄、報名資料一起刪除。
- 批次刪除文案與結果又表示：有課堂記錄的班級會被略過，不會刪除。

**影響**

- 使用者無法預測刪除結果。
- 相同資料狀態透過不同入口可能得到不同結果或不同期待。
- 這是業務規則分裂，不只是文案問題。

**修正建議**

- 先定義唯一刪除政策，只能三選一：
  - 有歷史或未來課堂就完全禁止刪除
  - 允許連集刪除
  - 僅允許刪除無任何關聯資料的班級
- 將同一規則同步到：
  - 操作選單 disabled 條件
  - 單筆刪除 dialog 文案
  - 批次刪除文案與結果訊息
  - 後端 API 回應格式
- 若採「部分可刪、部分略過」，單筆與批次都要採同一模型。

### P1. 教務管理仍保留 3 個可到達但不可用的路由，造成明顯死路

**位置**

- `apps/web/src/app/app.routes.ts:135`
- `apps/web/src/app/app.routes.ts:143`
- `apps/web/src/app/app.routes.ts:183`
- `apps/web/src/app/features/admin/pages/sessions/sessions.component.ts:1`
- `apps/web/src/app/features/admin/pages/schedule/schedule.page.ts:1`
- `apps/web/src/app/features/admin/pages/changes/changes.component.ts:1`

**現象**

- `/admin/sessions`
- `/admin/schedule`
- `/admin/changes`

以上路由仍存在且可直接進入，但頁面內容只是占位訊息。

**影響**

- 書籤、深連結、手動輸入 URL、內部導覽殘留都可能把使用者帶進死路。
- 這會讓教務管理的資訊架構看起來像未完成狀態。
- 若團隊已將實際功能整合到 `/admin/calendar`，這些路由現在是噪音。

**修正建議**

- 若已確定由 `/admin/calendar` 統一承接，直接移除這 3 個路由。
- 若短期不能移除，至少在進入時自動 redirect 到 `/admin/calendar`。
- 不要保留 `coming soon` 頁面在正式 admin 流程中。

### P1. 課程維護入口分裂成 `/admin/courses` 與 `/admin/classes` 兩套心智模型

**位置**

- `apps/web/src/app/app.routes.ts:177`
- `apps/web/src/app/app.routes.ts:213`
- `apps/web/src/app/core/smart-enums/routes-catalog.ts:105`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:575`
- `apps/web/src/app/features/admin/pages/classes/classes.page.ts:594`

**現象**

- `/admin/courses` 仍是正式路由。
- 但它在選單中隱藏。
- `/admin/classes` 頁面內又包含課程的新增、編輯、刪除入口。

**影響**

- 使用者不容易理解「課程主檔」應在哪裡維護。
- 造成功能重疊與維護成本增加。
- 也會讓 Claude 或其他工程師難以判斷後續應該強化哪一頁。

**修正建議**

- 明確決定以下其中一種結構：
  - `courses` 作為唯一課程主檔頁，`classes` 只管理班級
  - `classes` 作為唯一教務入口，`courses` 併入或移除
- 一旦決定後，同步清理：
  - route
  - menu
  - CTA 文案
  - 頁面標題與描述

### P1. 行事曆篩選的 badge、清除按鈕與實際篩選條件不一致

**位置**

- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:98`
- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:182`
- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:495`
- `apps/web/src/app/features/admin/pages/calendar/calendar.page.ts:527`
- `apps/web/src/app/features/admin/pages/calendar/components/session-filters/session-filters.component.html:17`

**現象**

- `activeFilterCount` 只計算課程、老師、班級。
- `hasActiveFilters` 也只看這三項。
- `clearFilters()` 只清這三項。
- 但 UI 上的篩選體驗同時包含：
  - 分校
  - 日期區間

**影響**

- 使用者會以為 badge 顯示的是所有生效中的篩選。
- 點「清除」後仍殘留分校或日期限制，體驗不直覺。
- 手機版更容易誤判，因為 filter 入口被壓縮到同一個按鈕。

**修正建議**

- 建立單一 filter state model。
- 明確定義哪些欄位算「篩選條件」：
  - 若分校是上下文，不計入 badge，就不能放進清除邏輯期待內
  - 若日期區間是查詢條件，就要納入 badge 與清除
- 手機與桌機要共用同一套判準。

### P2. `/admin/courses` 手機版列表缺乏大型資料集的操作能力

**位置**

- `apps/web/src/app/features/admin/pages/courses/courses.page.ts:124`
- `apps/web/src/app/features/admin/pages/courses/courses.page.html:31`
- `apps/web/src/app/features/admin/pages/courses/courses.page.html:121`
- `apps/web/src/app/features/admin/pages/courses/courses.page.html:214`

**現象**

- 桌機版表格有 paginator。
- 手機版直接渲染全部卡片，只顯示「共 N 個課程」。
- 頁面有啟用/停用統計，但篩選器沒有狀態篩選。

**影響**

- 課程數量一多，手機版捲動成本很高。
- 使用者看到統計數字，卻不能直接按狀態縮小範圍。
- 桌機與手機可操作性落差過大。

**修正建議**

- 補齊狀態篩選。
- 手機版至少擇一：
  - 與桌機共用分頁
  - `load more`
  - infinite scroll
- 若 `/admin/courses` 最終不保留，則不應再投入過多 UI 修補，改以資訊架構收斂為優先。

## 建議修正順序

1. 修正班級時段編輯不生效
2. 統一班級刪除規則與刪除入口行為
3. 移除或 redirect 舊教務路由：`schedule / sessions / changes`
4. 決定課程入口只保留一套：`courses` 或 `classes`
5. 統一 `calendar` 的篩選狀態模型
6. 視產品決策決定是否還要優化 `/admin/courses` 手機列表

## Claude 執行注意事項

- 不要參考 `PRD.md` 修這一輪。
- 先以現行路由與現有程式碼為準，先消除自相矛盾。
- 若第 4 項尚未定案，不要先大幅重做 `/admin/courses` 與 `/admin/classes` 的資訊架構。
- 第 1、2、3 項修完後，再決定是否要進一步收斂教務管理導覽。

## 驗收清單

- 編輯既有班級時段後，重新載入仍能看到更新值。
- 單筆刪除與批次刪除對同一種資料狀態有一致規則。
- `/admin/schedule`、`/admin/sessions`、`/admin/changes` 不再是死路。
- 使用者可以明確理解課程應在哪個頁面維護。
- `calendar` 的 badge、清除、實際篩選條件一致。
- 手機版不會因課程數量增加而快速失去可用性。
