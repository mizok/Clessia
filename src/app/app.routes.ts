import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

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
        data: { animation: 'Login' },
      },
      {
        path: 'trial',
        loadComponent: () =>
          import('./features/public/pages/trial/trial.component').then((m) => m.TrialComponent),
        data: { animation: 'Trial' },
      },
      {
        path: 'enrollment',
        loadComponent: () =>
          import('./features/public/pages/enrollment/enrollment.component').then(
            (m) => m.EnrollmentComponent,
          ),
        data: { animation: 'Enrollment' },
      },
      {
        path: 'qr-checkin',
        loadComponent: () =>
          import('./features/public/pages/qr-checkin/qr-checkin.component').then(
            (m) => m.QrCheckinComponent,
          ),
        data: { animation: 'QrCheckin' },
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/public/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
        data: { animation: 'ForgotPassword' },
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/public/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
        data: { animation: 'ResetPassword' },
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then((m) => m.AdminShellComponent),
    canActivate: [authGuard, roleGuard('admin')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        data: { animation: 'AdminDashboard' },
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/public/pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
        data: { animation: 'AdminChangePassword' },
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
    canActivate: [authGuard, roleGuard('teacher')],
    children: [
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/public/pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
        data: { animation: 'TeacherChangePassword' },
      },
    ],
  },
  {
    path: 'parent',
    loadComponent: () =>
      import('./features/parent/parent-shell/parent-shell.component').then(
        (m) => m.ParentShellComponent,
      ),
    canActivate: [authGuard, roleGuard('parent')],
    children: [
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/public/pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
        data: { animation: 'ParentChangePassword' },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
