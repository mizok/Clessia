import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  email = '';
  submitting = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  constructor(private readonly auth: AuthService) {}

  async onSubmit() {
    this.error.set(null);
    this.submitting.set(true);

    const errorMsg = await this.auth.sendPasswordReset(this.email);
    this.submitting.set(false);

    if (errorMsg) {
      this.error.set(errorMsg);
      return;
    }

    this.sent.set(true);
  }
}
