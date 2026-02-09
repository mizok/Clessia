import {
  Component,
  ViewChild,
  HostListener,
  inject,
  computed,
  input,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';
import { JdenticonAvatarComponent } from '../../jdenticon-avatar/jdenticon-avatar.component';
import { AuthService, type UserRole } from '../../../../core/auth.service';
import { AutoOpenTooltipDirective } from '../../../directives/auto-open-tooltip.directive';
import { DeviceService } from '../../../../core/device.service';

export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly badge?: number;
  readonly group?: string;
}

interface NavGroup {
  readonly label?: string;
  readonly items: NavItem[];
}

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [Tooltip, AutoOpenTooltipDirective, Popover, JdenticonAvatarComponent, RouterLink, RouterLinkActive],
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.scss',
})
export class ShellLayoutComponent {
  @ViewChild('op') op!: Popover;

  public readonly auth = inject(AuthService);
  protected readonly avatarSeed = computed(() => {
    return (this.auth.user()?.id || 'ANYMOUS') + '_' + (this.auth.profile()?.display_name || 'USER');
  });
  protected readonly device = inject(DeviceService);
  protected readonly roleLabels: Record<UserRole, string> = {
    admin: '管理員',
    teacher: '任課老師',
    parent: '家長',
  };

  private readonly router = inject(Router);

  @HostListener('window:resize')
  onResize() {
    this.op?.hide();
    this.moreOpen.set(false);
  }

  readonly sidebarOpen = signal(false);
  readonly moreOpen = signal(false);
  readonly moreClosing = signal(false);
  readonly centered = input(false, { transform: (v: boolean | string) => v === '' || v === true });
  readonly hasSubheader = input(false);
  readonly navItems = input<NavItem[]>([]);

  protected readonly primaryTabs = computed(() => {
    const items = this.navItems();
    return items.length > 4 ? items.slice(0, 4) : items;
  });

  protected readonly moreTabs = computed(() => {
    const items = this.navItems();
    return items.length > 4 ? items.slice(4) : [];
  });

  protected readonly groupedNav = computed<NavGroup[]>(() => {
    const items = this.navItems();
    const ungrouped: NavItem[] = [];
    const groupMap = new Map<string, NavItem[]>();

    for (const item of items) {
      if (item.group) {
        if (!groupMap.has(item.group)) groupMap.set(item.group, []);
        groupMap.get(item.group)!.push(item);
      } else {
        ungrouped.push(item);
      }
    }

    const groups: NavGroup[] = [];
    if (ungrouped.length > 0) groups.push({ items: ungrouped });
    for (const [label, groupItems] of groupMap) {
      groups.push({ label, items: groupItems });
    }
    return groups;
  });

  toggleSidebar() {
    this.sidebarOpen.update((v: boolean) => !v);
  }

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

  changePassword() {
    this.op.hide();
    const role = this.auth.activeRole();
    this.router.navigate([`/${role}/change-password`]);
  }

  signOut() {
    this.auth.signOut();
  }
}
