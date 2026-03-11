# Sessions UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 三項獨立的 UX 改善：icon 語意修正、批次操作結果加入略過原因、Header 加入未指派快速篩選 badge。

**Architecture:** 純前端改動，不動 API。Icon 修正為一行字串替換；批次摘要在 `sessions.page.ts` 的 onClose 回呼中加入 skip reason map；快速篩選透過 SessionsHeaderComponent 新增 input/output，沿用現有的 `__unassigned__` teacher filter 機制。

**Tech Stack:** Angular 21 Signals, PrimeNG 21, Vitest (via `npx nx test web`)

---

## Chunk 1: Icon 修正 + 批次摘要

### Task 1: 修正調課 icon

**Files:**
- Modify: `apps/web/src/app/features/admin/pages/sessions/sessions.page.ts:246`

- [ ] **Step 1: 修改 icon 字串**

在 `sessions.page.ts` 第 246 行，將：
```typescript
items.push({ label: '調課', icon: 'pi pi-calendar-clock', command: () => this.openReschedule(s) });
```
改為：
```typescript
items.push({ label: '調課', icon: 'pi pi-arrows-h', command: () => this.openReschedule(s) });
```

- [ ] **Step 2: 執行測試確認無破壞**

```bash
npx nx test web
```
Expected: 全部測試通過。

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/features/admin/pages/sessions/sessions.page.ts
git commit -m "fix: replace pi-calendar-clock with pi-arrows-h for reschedule action"
```

---

### Task 2: 批次操作結果加入略過原因說明

**Files:**
- Modify: `apps/web/src/app/features/admin/pages/sessions/sessions.page.ts:302-315`
- Modify: `apps/web/src/app/features/admin/pages/sessions/sessions.page.spec.ts`

- [ ] **Step 1: 在 spec 加入失敗測試**

在 `sessions.page.spec.ts` 的 `describe('SessionsPage')` 裡，加入以下測試（加在最後一個 `it` 之後）：

```typescript
it('openBatchSheet should show skip reason in toast when sessions are skipped', async () => {
  const mockResult = {
    action: 'applied' as const,
    mode: 'cancel' as const,
    updated: 3,
    skipped: 2,
  };

  const dialogOpenSpy = vi
    .spyOn(
      (component as unknown as { dialogService: { open: (...args: unknown[]) => unknown } })
        .dialogService,
      'open',
    )
    .mockReturnValue({ onClose: of(mockResult) });

  const messageAddSpy = vi.spyOn(
    (component as unknown as { messageService: { add: (...args: unknown[]) => void } })
      .messageService,
    'add',
  );

  (component as unknown as { openBatchSheet: () => void }).openBatchSheet();
  await fixture.whenStable();

  expect(dialogOpenSpy).toHaveBeenCalledTimes(1);
  expect(messageAddSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: expect.stringContaining('已停課的課堂無法重複操作'),
    }),
  );
});

it('openBatchSheet should not show skip reason when no sessions are skipped', async () => {
  const mockResult = {
    action: 'applied' as const,
    mode: 'cancel' as const,
    updated: 5,
    skipped: 0,
  };

  vi.spyOn(
    (component as unknown as { dialogService: { open: (...args: unknown[]) => unknown } })
      .dialogService,
    'open',
  ).mockReturnValue({ onClose: of(mockResult) });

  const messageAddSpy = vi.spyOn(
    (component as unknown as { messageService: { add: (...args: unknown[]) => void } })
      .messageService,
    'add',
  );

  (component as unknown as { openBatchSheet: () => void }).openBatchSheet();
  await fixture.whenStable();

  expect(messageAddSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: '已停課 5 堂',
    }),
  );
});
```

- [ ] **Step 2: 確認測試目前失敗**

```bash
npx nx test web -- --reporter=verbose 2>&1 | grep -A 3 "skip reason"
```
Expected: FAIL（`stringContaining('已停課的課堂無法重複操作')` 不符合現有邏輯）。

- [ ] **Step 3: 實作略過原因邏輯**

在 `sessions.page.ts` 找到 `openBatchSheet` 方法內的 `ref?.onClose.subscribe` 回呼，將：

```typescript
const detail = result.skipped > 0
  ? `已${label} ${result.updated} 堂，略過 ${result.skipped} 堂`
  : `已${label} ${result.updated} 堂`;
this.messageService.add({ severity: 'success', summary: '批次操作完成', detail });
```

改為：

```typescript
const skipReasonMap: Record<string, string> = {
  cancel: '已停課的課堂無法重複操作',
  uncancel: '僅停課中的課堂可取消停課',
  assign: '已指派老師的課堂已略過',
  time: '已停課的課堂無法調整時間',
};
const skipReason = skipReasonMap[result.mode] ?? '條件不符';
const detail =
  result.skipped > 0
    ? `已${label} ${result.updated} 堂，略過 ${result.skipped} 堂（${skipReason}）`
    : `已${label} ${result.updated} 堂`;
this.messageService.add({ severity: 'success', summary: '批次操作完成', detail });
```

- [ ] **Step 4: 確認測試通過**

```bash
npx nx test web
```
Expected: 全部測試通過。

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/features/admin/pages/sessions/sessions.page.ts \
        apps/web/src/app/features/admin/pages/sessions/sessions.page.spec.ts
git commit -m "feat: add skip reason explanation to batch operation toast"
```

---

## Chunk 2: 未指派快速篩選 Badge

### Task 3: SessionsHeaderComponent 新增 input/output

**Files:**
- Modify: `apps/web/src/app/features/admin/pages/sessions/components/sessions-header/sessions-header.component.ts`
- Modify: `apps/web/src/app/features/admin/pages/sessions/components/sessions-header/sessions-header.component.html`
- Modify: `apps/web/src/app/features/admin/pages/sessions/components/sessions-header/sessions-header.component.scss`
- Modify: `apps/web/src/app/features/admin/pages/sessions/components/sessions-header/sessions-header.component.spec.ts`

- [ ] **Step 1: 寫 SessionsHeaderComponent 的失敗測試**

取代 `sessions-header.component.spec.ts` 現有內容：

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionsHeaderComponent } from './sessions-header.component';

describe('SessionsHeaderComponent', () => {
  let component: SessionsHeaderComponent;
  let fixture: ComponentFixture<SessionsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show badge when unassignedCount is 0', async () => {
    fixture.componentRef.setInput('unassignedCount', 0);
    await fixture.whenStable();
    const badge = fixture.nativeElement.querySelector('.sessions-header__badge');
    expect(badge).toBeNull();
  });

  it('should show badge with count when unassignedCount > 0', async () => {
    fixture.componentRef.setInput('unassignedCount', 5);
    await fixture.whenStable();
    const badge = fixture.nativeElement.querySelector('.sessions-header__badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toContain('5');
    expect(badge.textContent.trim()).toContain('堂未指派');
  });

  it('should emit filterUnassigned when badge is clicked', async () => {
    fixture.componentRef.setInput('unassignedCount', 3);
    await fixture.whenStable();

    const emitted: void[] = [];
    component.filterUnassigned.subscribe(() => emitted.push());

    const badge = fixture.nativeElement.querySelector('.sessions-header__badge');
    badge.click();

    expect(emitted).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 確認測試目前失敗**

```bash
npx nx test web -- --reporter=verbose 2>&1 | grep -A 3 "SessionsHeader"
```
Expected: FAIL（`unassignedCount` input 不存在）。

- [ ] **Step 3: 更新 SessionsHeaderComponent TypeScript**

取代 `sessions-header.component.ts` 全部內容：

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sessions-header',
  imports: [],
  templateUrl: './sessions-header.component.html',
  styleUrl: './sessions-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsHeaderComponent {
  readonly unassignedCount = input<number>(0);
  readonly filterUnassigned = output<void>();
}
```

- [ ] **Step 4: 更新 HTML**

取代 `sessions-header.component.html` 全部內容：

```html
<section class="sessions-header">
  <div class="sessions-header__title-group">
    <h1 class="sessions-header__title">課堂管理</h1>
    @if (unassignedCount() > 0) {
      <button
        type="button"
        class="sessions-header__badge"
        (click)="filterUnassigned.emit()"
      >
        {{ unassignedCount() }} 堂未指派
      </button>
    }
  </div>
</section>
```

- [ ] **Step 5: 更新 badge 樣式**

在 `sessions-header.component.scss`，**替換**現有的 `&__title-group` 定義（原為 `flex-direction: column; gap: var(--space-1); position: relative`），並在其後加入 `&__badge`：

```scss
  &__title-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    border: none;
    border-radius: var(--radius-full);
    background: var(--p-orange-100);
    color: var(--p-orange-700);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
      background: var(--p-orange-200);
    }
  }
```

- [ ] **Step 6: 確認測試通過**

```bash
npx nx test web
```
Expected: 全部測試通過。

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/features/admin/pages/sessions/components/sessions-header/
git commit -m "feat: add unassigned count badge to sessions header"
```

---

### Task 4: 在 sessions.page 串接 badge 邏輯

**Files:**
- Modify: `apps/web/src/app/features/admin/pages/sessions/sessions.page.ts`
- Modify: `apps/web/src/app/features/admin/pages/sessions/sessions.page.html`
- Modify: `apps/web/src/app/features/admin/pages/sessions/sessions.page.spec.ts`

- [ ] **Step 1: 在 sessions.page.spec.ts 加入失敗測試**

在現有測試最後加入：

```typescript
it('unassignedCount should count sessions with unassigned status excluding cancelled', () => {
  const mockSessions = [
    { id: '1', assignmentStatus: 'unassigned', status: 'scheduled' },
    { id: '2', assignmentStatus: 'unassigned', status: 'cancelled' }, // 不計
    { id: '3', assignmentStatus: 'assigned', status: 'scheduled' },   // 不計
    { id: '4', assignmentStatus: 'unassigned', status: 'scheduled' },
  ] as Session[];

  (component as unknown as { sessions: { set: (v: Session[]) => void } }).sessions.set(
    mockSessions,
  );

  const count = (component as unknown as { unassignedCount: { (): number } }).unassignedCount();
  expect(count).toBe(2);
});

it('onFilterUnassigned should set selectedTeacherIds to __unassigned__', () => {
  (
    component as unknown as { onFilterUnassigned: () => void }
  ).onFilterUnassigned();

  const ids = (
    component as unknown as { selectedTeacherIds: { (): string[] } }
  ).selectedTeacherIds();
  expect(ids).toEqual(['__unassigned__']);
});
```

- [ ] **Step 2: 確認測試目前失敗**

```bash
npx nx test web -- --reporter=verbose 2>&1 | grep -A 3 "unassignedCount\|onFilterUnassigned"
```
Expected: FAIL。

- [ ] **Step 3: 在 sessions.page.ts 加入 computed 和 handler**

在 `sessions.page.ts` 的 `// ── Computed ───` 區塊，`filteredSessions` computed 之後加入：

```typescript
protected readonly unassignedCount = computed(() =>
  this.sessions().filter(
    (s) => s.assignmentStatus === 'unassigned' && s.status !== 'cancelled',
  ).length,
);
```

在 `// ── Filters ────` 區塊找到 `protected clearFilters()` 方法，在其之前加入：

```typescript
protected onFilterUnassigned(): void {
  this.selectedTeacherIds.set(['__unassigned__']);
  this.syncQueryParams();
}
```

- [ ] **Step 4: 在 sessions.page.html 串接 input/output**

找到 `<app-sessions-header />` 改為：

```html
<app-sessions-header
  [unassignedCount]="unassignedCount()"
  (filterUnassigned)="onFilterUnassigned()"
/>
```

- [ ] **Step 5: 確認測試通過**

```bash
npx nx test web
```
Expected: 全部測試通過。

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/features/admin/pages/sessions/sessions.page.ts \
        apps/web/src/app/features/admin/pages/sessions/sessions.page.html \
        apps/web/src/app/features/admin/pages/sessions/sessions.page.spec.ts
git commit -m "feat: wire unassigned quick-filter badge in sessions page"
```


