import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { ShellLayoutComponent, type NavItem } from '../../shared/components/layout/shell-layout/shell-layout.component';
import { fadeAnimation } from '../../shared/animations';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, ShellLayoutComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  animations: [fadeAnimation],
})
export class AdminShellComponent {
  private readonly contexts = inject(ChildrenOutletContexts);

  protected readonly navItems: NavItem[] = [
    { label: '儀表板', icon: 'pi-home', route: '/admin/dashboard' },
    { label: '行事曆', icon: 'pi-calendar', route: '/admin/calendar', group: '行政作業' },
    { label: '出缺席', icon: 'pi-check-circle', route: '/admin/attendance', group: '行政作業' },
    { label: '假單管理', icon: 'pi-file', route: '/admin/leave', group: '行政作業' },
    { label: '學生', icon: 'pi-users', route: '/admin/students', group: '學員管理' },
    { label: '家長', icon: 'pi-user', route: '/admin/parents', group: '學員管理' },
    { label: '課程', icon: 'pi-book', route: '/admin/courses', group: '課務管理' },
    { label: '排課', icon: 'pi-table', route: '/admin/schedule', group: '課務管理' },
    { label: '繳費紀錄', icon: 'pi-credit-card', route: '/admin/payments', group: '財務' },
    { label: '報表', icon: 'pi-chart-bar', route: '/admin/reports', group: '財務' },
    { label: '分校管理', icon: 'pi-building', route: '/admin/campuses', group: '系統' },
    { label: '設定', icon: 'pi-cog', route: '/admin/settings', group: '系統' },
  ];

  protected getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
