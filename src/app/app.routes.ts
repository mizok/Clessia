import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/public-shell.component').then((m) => m.PublicShellComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/public/pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'trial',
        loadComponent: () =>
          import('./features/public/pages/trial/trial.component').then((m) => m.TrialComponent),
      },
      {
        path: 'enrollment',
        loadComponent: () =>
          import('./features/public/pages/enrollment/enrollment.component').then(
            (m) => m.EnrollmentComponent,
          ),
      },
      {
        path: 'qr-checkin',
        loadComponent: () =>
          import('./features/public/pages/qr-checkin/qr-checkin.component').then(
            (m) => m.QrCheckinComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/public/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/public/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then((m) => m.AdminShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'teacher',
    loadComponent: () =>
      import('./features/teacher/teacher-shell/teacher-shell.component').then(
        (m) => m.TeacherShellComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'parent',
    loadComponent: () =>
      import('./features/parent/parent-shell/parent-shell.component').then(
        (m) => m.ParentShellComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
