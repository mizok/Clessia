import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { ShellLayoutComponent } from '../../../shared/components/layout/shell-layout/shell-layout.component';
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

  protected getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
