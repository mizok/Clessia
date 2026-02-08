import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { AuthService } from '../../core/auth.service';
import { AutoOpenTooltipDirective } from '../../shared/directives/auto-open-tooltip.directive';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, Tooltip, AutoOpenTooltipDirective],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  constructor(protected readonly auth: AuthService) {}

  signOut() {
    this.auth.signOut();
  }
}
