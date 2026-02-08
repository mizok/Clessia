import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { AuthService } from '../../../core/auth.service';
import { AutoOpenTooltipDirective } from '../../../shared/directives/auto-open-tooltip.directive';

@Component({
  selector: 'app-parent-shell',
  imports: [RouterOutlet, Tooltip, AutoOpenTooltipDirective],
  templateUrl: './parent-shell.component.html',
  styleUrl: './parent-shell.component.scss',
})
export class ParentShellComponent {
  constructor(protected readonly auth: AuthService) {}

  signOut() {
    this.auth.signOut();
  }
}
