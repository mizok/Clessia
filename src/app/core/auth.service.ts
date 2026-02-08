import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export type UserRole = 'admin' | 'staff' | 'teacher' | 'parent';

export interface Profile {
  id: string;
  display_name: string;
  branch_id: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  private readonly _profile = signal<Profile | null>(null);
  private readonly _roles = signal<UserRole[]>([]);
  private readonly _activeRole = signal<UserRole | null>(null);
  private readonly _loading = signal(true);
  private readonly _showRolePicker = signal(false);

  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly activeRole = this._activeRole.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly showRolePicker = this._showRolePicker.asReadonly();

  private readonly supabase: SupabaseService['client'];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
  ) {
    this.supabase = this.supabaseService.client;
    this.init();
  }

  private async init() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    if (session?.user) {
      this._user.set(session.user);
      await this.loadProfile(session.user.id);
    }
    this._loading.set(false);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._user.set(session?.user ?? null);
      if (session?.user) {
        // 不 await，避免阻塞 Supabase 內部的 auth 通知鏈（例如 updateUser 會等通知完成）
        void this.loadProfile(session.user.id);
      } else {
        this._profile.set(null);
        this._roles.set([]);
        this._activeRole.set(null);
      }
    });
  }

  private async loadProfile(userId: string) {
    const [profileResult, rolesResult] = await Promise.all([
      this.supabase.from('profiles').select('id, display_name, branch_id').eq('id', userId).single(),
      this.supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    this._profile.set(profileResult.data as Profile | null);
    const roles = (rolesResult.data ?? []).map((r) => r.role as UserRole);
    this._roles.set(roles);

    // Auto-select if user has exactly one role
    if (roles.length === 1) {
      this._activeRole.set(roles[0]);
    }
  }

  setActiveRole(role: UserRole) {
    this._activeRole.set(role);
  }

  openRolePicker() {
    this._showRolePicker.set(true);
  }

  closeRolePicker() {
    this._showRolePicker.set(false);
  }

  async signIn(email: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    if (data.user) {
      this._user.set(data.user);
      await this.loadProfile(data.user.id);
    }
    return null;
  }

  private readonly shellMap: Record<UserRole, string> = {
    admin: '/admin',
    staff: '/admin',
    teacher: '/teacher',
    parent: '/parent',
  };

  navigateToRoleShell(role: UserRole) {
    this.setActiveRole(role);
    this.closeRolePicker();
    this.router.navigate([this.shellMap[role]]);
  }

  setRememberMe(value: boolean): void {
    localStorage.setItem('clessia:remember-me', String(value));
  }

  async sendPasswordReset(email: string): Promise<string | null> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error?.message ?? null;
  }

  async updatePassword(newPassword: string): Promise<string | null> {
    const { error } = await this.supabase.auth.updateUser({ password: newPassword });
    return error?.message ?? null;
  }

  async signOut() {
    this.closeRolePicker();
    await this.supabase.auth.signOut();
    this._user.set(null);
    this._profile.set(null);
    this._roles.set([]);
    this._activeRole.set(null);
    this.router.navigate(['/login']);
  }
}
