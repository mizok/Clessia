import {
  AfterViewInit,
  Directive,
  OnDestroy,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

@Directive({
  selector: '[appAutoOpenTooltip]',
  standalone: true,
})
export class AutoOpenTooltipDirective implements AfterViewInit, OnDestroy {
  private readonly tooltip = inject(Tooltip, { self: true });
  readonly autoShow = input(true, { alias: 'appAutoOpenTooltip', transform: booleanAttribute });
  readonly initialDelay = input(0, {
    alias: 'appAutoOpenTooltipInitialDelay',
    transform: numberAttribute,
  });
  readonly leaveDelay = input(3000, { alias: 'appAutoOpenTooltipLeaveDelay', transform: numberAttribute });
  readonly animate = input(true, { alias: 'appAutoOpenTooltipAnimate', transform: booleanAttribute });
  readonly enterDelay = input(0, {
    alias: 'appAutoOpenTooltipEnterDelay',
    transform: numberAttribute,
  });
  readonly enterDuration = input(180, {
    alias: 'appAutoOpenTooltipEnterDuration',
    transform: numberAttribute,
  });
  readonly leaveDuration = input(180, {
    alias: 'appAutoOpenTooltipLeaveDuration',
    transform: numberAttribute,
  });

  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;
  private enterFrameTimer: ReturnType<typeof setTimeout> | null = null;
  private leaveTransitionCleanup: (() => void) | null = null;

  ngAfterViewInit(): void {
    if (!this.autoShow()) {
      return;
    }

    const initialDelay = Math.max(0, this.initialDelay());
    const enterDelay = this.animate() ? Math.max(0, this.enterDelay()) : 0;

    this.showTimer = setTimeout(() => {
      this.tooltip.show();
      this.applyAnimationConfig();
      this.triggerEnterAnimation();
      this.startHideTimer();
    }, initialDelay + enterDelay);
  }

  ngOnDestroy(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
    }

    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
    }

    if (this.leaveTimer !== null) {
      clearTimeout(this.leaveTimer);
    }

    if (this.enterFrameTimer !== null) {
      clearTimeout(this.enterFrameTimer);
    }

    this.clearLeaveTransitionCleanup();
  }

  private startHideTimer(): void {
    const leaveDelay = Math.max(0, this.leaveDelay());
    const configuredLeaveDuration = this.animate() ? Math.max(0, this.leaveDuration()) : 0;
    const leaveDuration = Math.min(configuredLeaveDuration, leaveDelay);
    const holdDuration = leaveDelay - leaveDuration;

    this.hideTimer = setTimeout(() => {
      if (leaveDuration === 0) {
        this.tooltip.hide();
        return;
      }

      const container = this.getTooltipContainer();
      if (container === null) {
        this.tooltip.hide();
        return;
      }

      this.startLeaveAnimation(container, leaveDuration);
    }, holdDuration);
  }

  private applyAnimationConfig(): void {
    const container = this.getTooltipContainer();
    if (container === null) {
      return;
    }

    const enterDuration = this.animate() ? Math.max(0, this.enterDuration()) : 0;
    const leaveDuration = this.animate() ? Math.max(0, this.leaveDuration()) : 0;

    container.style.setProperty('--clessia-tooltip-enter-duration', `${enterDuration}ms`);
    container.style.setProperty('--clessia-tooltip-leave-duration', `${leaveDuration}ms`);
  }

  private triggerEnterAnimation(): void {
    const container = this.getTooltipContainer();
    if (container === null) {
      return;
    }

    container.classList.remove('clessia-tooltip--leaving');
    container.classList.remove('clessia-tooltip--pre-enter');

    if (!this.animate() || Math.max(0, this.enterDuration()) === 0) {
      return;
    }

    container.classList.add('clessia-tooltip--pre-enter');
    void container.offsetWidth;
    this.enterFrameTimer = setTimeout(() => {
      container.classList.remove('clessia-tooltip--pre-enter');
    }, 16);
  }

  private getTooltipContainer(): HTMLElement | null {
    return (this.tooltip as Tooltip & { container?: HTMLElement | null }).container ?? null;
  }

  private startLeaveAnimation(container: HTMLElement, leaveDuration: number): void {
    this.clearLeaveTransitionCleanup();

    container.classList.add('clessia-tooltip--leaving');
    container.classList.remove('clessia-tooltip--pre-enter');

    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      this.clearLeaveTransitionCleanup();
      this.tooltip.hide();
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== container) {
        return;
      }

      if (event.propertyName !== 'transform') {
        return;
      }

      finish();
    };

    container.addEventListener('transitionend', onTransitionEnd);
    this.leaveTransitionCleanup = () => {
      container.removeEventListener('transitionend', onTransitionEnd);
    };

    // Fallback: transition 事件若未觸發，仍在預期時間後收尾
    this.leaveTimer = setTimeout(finish, leaveDuration + 80);
  }

  private clearLeaveTransitionCleanup(): void {
    if (this.leaveTransitionCleanup !== null) {
      this.leaveTransitionCleanup();
      this.leaveTransitionCleanup = null;
    }

    if (this.leaveTimer !== null) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  }
}
