import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { SelectRoleComponent } from './features/select-role/select-role.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SelectRoleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
}
