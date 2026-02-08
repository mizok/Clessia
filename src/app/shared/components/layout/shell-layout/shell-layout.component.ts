import { Component, ViewChild, HostListener, inject, computed, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';
import { JdenticonAvatarComponent } from '../../jdenticon-avatar/jdenticon-avatar.component';
import { AuthService, type UserRole } from '../../../../core/auth.service';
import { AutoOpenTooltipDirective } from '../../../directives/auto-open-tooltip.directive';
import { DeviceService } from '../../../../core/device.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [Tooltip, AutoOpenTooltipDirective, Popover, JdenticonAvatarComponent],
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.scss',
})
export class ShellLayoutComponent {
  @ViewChild('op') op!: Popover;

  public readonly auth = inject(AuthService);
  protected readonly avatarSeed = computed(() => {
    return (this.auth.user()?.id   || 'ANYMOUS')+ '_' + (this.auth.profile()?.display_name || 'USER');
  });
  protected readonly device = inject(DeviceService)
  protected readonly roleLabels: Record<UserRole, string> = {
    admin: '管理員',
    teacher: '任課老師',
    parent: '家長',
  };

  private readonly router = inject(Router);

  @HostListener('window:resize')
  onResize() {
    this.op?.hide();
  }

  readonly sidebarOpen = signal(false);
  readonly centered = input(false, { transform: (v: boolean | string) => v === '' || v === true });

  toggleSidebar() {
    this.sidebarOpen.update((v: boolean) => !v);
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
