import { Component, computed, inject } from '@angular/core';
import { AuthService, type UserRole } from '../../core/auth.service';

interface RoleOption {
  role: UserRole;
  icon: string;
  label: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: 'admin', icon: 'pi-shield', label: '管理者', description: '跨分校管理、系統設定、日常營運' },
  { role: 'staff', icon: 'pi-clipboard', label: '行政老師', description: '行政事務、學生管理、排課協助' },
  { role: 'teacher', icon: 'pi-book', label: '任課老師', description: '課表、點名、學生學習紀錄' },
  { role: 'parent', icon: 'pi-users', label: '家長', description: '出缺席、學習進度、繳費' },
];

@Component({
  selector: 'app-select-role',
  imports: [],
  templateUrl: './select-role.component.html',
  styleUrl: './select-role.component.scss',
})
export class SelectRoleComponent {
  protected readonly auth = inject(AuthService);

  readonly displayName = computed(
    () => this.auth.profile()?.display_name || this.auth.user()?.email || '',
  );
  readonly roleOptions = computed(() =>
    ROLE_OPTIONS.filter((opt) => this.auth.roles().includes(opt.role)),
  );
  readonly activeRole = this.auth.activeRole;

  selectRole(role: UserRole) {
    this.auth.navigateToRoleShell(role);
  }

  close() {
    this.auth.closeRolePicker();
  }
}
