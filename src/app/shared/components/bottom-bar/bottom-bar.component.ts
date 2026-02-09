import { Component, HostListener, computed, signal, input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationStart } from '@angular/router';

export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly badge?: number;
}

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss',
})
export class BottomBarComponent {
  private readonly router = inject(Router);
  readonly navItems = input<NavItem[]>([]);
  readonly moreOpen = signal(false);
  readonly moreClosing = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.moreOpen.set(false);
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.moreOpen.set(false);
  }

  protected readonly primaryTabs = computed(() => {
    const items = this.navItems();
    return items.length > 4 ? items.slice(0, 4) : items;
  });

  protected readonly moreTabs = computed(() => {
    const items = this.navItems();
    return items.length > 4 ? items.slice(4) : [];
  });

  protected toggleMore(): void {
    if (this.moreOpen()) {
      this.closeMore();
    } else {
      this.moreOpen.set(true);
    }
  }

  protected closeMore(): void {
    if (this.moreClosing()) return;
    this.moreClosing.set(true);
    setTimeout(() => {
      this.moreOpen.set(false);
      this.moreClosing.set(false);
    }, 350);
  }
}
