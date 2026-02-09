import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { ShellLayoutComponent, type NavItem } from '../../../shared/components/layout/shell-layout/shell-layout.component';
import { fadeAnimation } from '../../../shared/animations';

@Component({
  selector: 'app-parent-shell',
  standalone: true,
  imports: [RouterOutlet, ShellLayoutComponent],
  templateUrl: './parent-shell.component.html',
  styleUrl: './parent-shell.component.scss',
  animations: [fadeAnimation],
})
export class ParentShellComponent {
  private readonly contexts = inject(ChildrenOutletContexts);

  protected readonly navItems: NavItem[] = [
    { label: '總覽', icon: 'pi-home', route: '/parent/dashboard' },
    { label: '出缺席', icon: 'pi-check-circle', route: '/parent/attendance' },
    { label: '課表', icon: 'pi-calendar', route: '/parent/schedule' },
    { label: '通知', icon: 'pi-bell', route: '/parent/notifications' },
    { label: '成績', icon: 'pi-chart-line', route: '/parent/grades' },
    { label: '餐食', icon: 'pi-box', route: '/parent/meals' },
    { label: '試課', icon: 'pi-star', route: '/parent/trial' },
    { label: '報名', icon: 'pi-user-plus', route: '/parent/enrollment' },
    { label: '加課', icon: 'pi-plus-circle', route: '/parent/add-course' },
    { label: '繳費', icon: 'pi-credit-card', route: '/parent/payments' },
    { label: '續費', icon: 'pi-refresh', route: '/parent/renewal' },
  ];

  protected getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
