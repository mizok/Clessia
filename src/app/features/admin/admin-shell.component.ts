import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { ShellLayoutComponent } from '../../shared/components/layout/shell-layout/shell-layout.component';
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

  protected getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
