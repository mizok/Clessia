import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { AuthService } from '../../../core/auth.service';
import { AutoOpenTooltipDirective } from '../../../shared/directives/auto-open-tooltip.directive';

@Component({
  selector: 'app-teacher-shell',
  imports: [RouterOutlet, Tooltip, AutoOpenTooltipDirective],
  templateUrl: './teacher-shell.component.html',
  styleUrl: './teacher-shell.component.scss',
})
export class TeacherShellComponent {
  constructor(protected readonly auth: AuthService) {}

  signOut() {
    this.auth.signOut();
  }
}
