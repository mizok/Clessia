import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { ShellLayoutComponent, type NavItem } from '../../../shared/components/layout/shell-layout/shell-layout.component';
import { fadeAnimation } from '../../../shared/animations';

@Component({
  selector: 'app-teacher-shell',
  standalone: true,
  imports: [RouterOutlet, ShellLayoutComponent],
  templateUrl: './teacher-shell.component.html',
  styleUrl: './teacher-shell.component.scss',
  animations: [fadeAnimation],
})
export class TeacherShellComponent {
  private readonly contexts = inject(ChildrenOutletContexts);

  protected readonly navItems: NavItem[] = [
    { label: '課表', icon: 'pi-calendar', route: '/teacher/calendar' },
    { label: '評量', icon: 'pi-file-edit', route: '/teacher/assessments' },
    { label: '通知', icon: 'pi-bell', route: '/teacher/notifications' },
  ];

  protected getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
