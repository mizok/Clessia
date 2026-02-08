import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  error = signal<string | null>(null);
  submitting = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit() {
    this.error.set(null);
    this.submitting.set(true);

    this.auth.setRememberMe(this.rememberMe);
    const errorMsg = await this.auth.signIn(this.email, this.password);
    this.submitting.set(false);

    if (errorMsg) {
      this.error.set(errorMsg);
      return;
    }

    const roles = this.auth.roles();
    if (roles.length === 0) {
      this.error.set('此帳號尚未被指派角色，請聯繫管理員');
      return;
    }

    this.auth.navigateToRoleShell(roles[0]);
  }
}
