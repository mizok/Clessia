import { UserType } from './user-type';

export class RouteObj {
  constructor(
    public readonly relativePath: string,
    public readonly absolutePath: string,
    public readonly label: string,
    public readonly role: UserType,
    public readonly icon: string,
    public readonly visible: boolean = true,
    public readonly group?: string
  ) {}
}

export class RoutesCatalog {
  public static readonly values: RouteObj[] = [];
  // Admin
  public static readonly ADMIN_ROOT = this.register('admin', '/admin', '管理員', UserType.ADMIN, 'pi-shield', false);
  public static readonly ADMIN_DASHBOARD = this.register('dashboard', '/admin/dashboard', '儀表板', UserType.ADMIN, 'pi-home');
  public static readonly ADMIN_CALENDAR = this.register('calendar', '/admin/calendar', '行事曆', UserType.ADMIN, 'pi-calendar', true, '行政作業');
  public static readonly ADMIN_ATTENDANCE = this.register('attendance', '/admin/attendance', '出缺席', UserType.ADMIN, 'pi-check-circle', true, '行政作業');
  public static readonly ADMIN_LEAVE = this.register('leave', '/admin/leave', '假單管理', UserType.ADMIN, 'pi-file', true, '行政作業');
  public static readonly ADMIN_STUDENTS = this.register('students', '/admin/students', '學生', UserType.ADMIN, 'pi-users', true, '學員管理');
  public static readonly ADMIN_PARENTS = this.register('parents', '/admin/parents', '家長', UserType.ADMIN, 'pi-user', true, '學員管理');
  public static readonly ADMIN_COURSES = this.register('courses', '/admin/courses', '課程', UserType.ADMIN, 'pi-book', true, '課務管理');
  public static readonly ADMIN_SCHEDULE = this.register('schedule', '/admin/schedule', '排課', UserType.ADMIN, 'pi-table', true, '課務管理');
  public static readonly ADMIN_PAYMENTS = this.register('payments', '/admin/payments', '繳費紀錄', UserType.ADMIN, 'pi-credit-card', true, '財務');
  public static readonly ADMIN_REPORTS = this.register('reports', '/admin/reports', '報表', UserType.ADMIN, 'pi-chart-bar', true, '財務');
  public static readonly ADMIN_CAMPUSES = this.register('campuses', '/admin/campuses', '分校管理', UserType.ADMIN, 'pi-building', true, '系統');
  public static readonly ADMIN_SETTINGS = this.register('settings', '/admin/settings', '設定', UserType.ADMIN, 'pi-cog', true, '系統');

  // Teacher
  public static readonly TEACHER_ROOT = this.register('teacher', '/teacher', '老師', UserType.TEACHER, 'pi-user', false);
  public static readonly TEACHER_DASHBOARD = this.register('dashboard', '/teacher/dashboard', '儀表板', UserType.TEACHER, 'pi-home');
  public static readonly TEACHER_SCHEDULE = this.register('schedule', '/teacher/schedule', '課表', UserType.TEACHER, 'pi-calendar');
  public static readonly TEACHER_ATTENDANCE = this.register('attendance', '/teacher/attendance', '點名', UserType.TEACHER, 'pi-check-circle');
  public static readonly TEACHER_STUDENTS = this.register('students', '/teacher/students', '學生', UserType.TEACHER, 'pi-users');
  
  // Parent
  public static readonly PARENT_ROOT = this.register('parent', '/parent', '家長', UserType.PARENT, 'pi-user', false);
  public static readonly PARENT_DASHBOARD = this.register('dashboard', '/parent/dashboard', '儀表板', UserType.PARENT, 'pi-home');
  public static readonly PARENT_ATTENDANCE = this.register('attendance', '/parent/attendance', '出缺席', UserType.PARENT, 'pi-calendar');
  public static readonly PARENT_PAYMENTS = this.register('payments', '/parent/payments', '繳費', UserType.PARENT, 'pi-wallet');
  public static readonly PARENT_COMMUNICATION = this.register('communication', '/parent/communication', '聯絡簿', UserType.PARENT, 'pi-book');

  private static register(
    relativePath: string,
    absolutePath: string,
    label: string,
    role: UserType,
    icon: string,
    visible: boolean = true,
    group?: string
  ): RouteObj {
    const route = new RouteObj(relativePath, absolutePath, label, role, icon, visible, group);
    this.values.push(route);
    return route;
  }

  public static findByAbsolutePath(path: string): RouteObj | undefined {
    return this.values.find((p) => p.absolutePath === path);
  }
}
