import { UserType } from './user-type';

export class RouteObj{
constructor(
    public readonly relativePath: string,
    public readonly absolutePath: string,
    public readonly label: string,
    public readonly role: UserType,
    public readonly icon: string,
    public readonly visible: boolean = true,
    public readonly group?: string
  ) {
    RoutesCatalog.values.push(this);
  }
}

export class RoutesCatalog {
  // Admin
  public static readonly ADMIN_ROOT = new RouteObj('admin', '/admin', '管理員', UserType.ADMIN, 'pi-shield', false);
  public static readonly ADMIN_DASHBOARD = new RouteObj('dashboard', '/admin/dashboard', '儀表板', UserType.ADMIN, 'pi-home');
  public static readonly ADMIN_CALENDAR = new RouteObj('calendar', '/admin/calendar', '行事曆', UserType.ADMIN, 'pi-calendar', true, '行政作業');
  public static readonly ADMIN_ATTENDANCE = new RouteObj('attendance', '/admin/attendance', '出缺席', UserType.ADMIN, 'pi-check-circle', true, '行政作業');
  public static readonly ADMIN_LEAVE = new RouteObj('leave', '/admin/leave', '假單管理', UserType.ADMIN, 'pi-file', true, '行政作業');
  public static readonly ADMIN_STUDENTS = new RouteObj('students', '/admin/students', '學生', UserType.ADMIN, 'pi-users', true, '學員管理');
  public static readonly ADMIN_PARENTS = new RouteObj('parents', '/admin/parents', '家長', UserType.ADMIN, 'pi-user', true, '學員管理');
  public static readonly ADMIN_COURSES = new RouteObj('courses', '/admin/courses', '課程', UserType.ADMIN, 'pi-book', true, '課務管理');
  public static readonly ADMIN_SCHEDULE = new RouteObj('schedule', '/admin/schedule', '排課', UserType.ADMIN, 'pi-table', true, '課務管理');
  public static readonly ADMIN_PAYMENTS = new RouteObj('payments', '/admin/payments', '繳費紀錄', UserType.ADMIN, 'pi-credit-card', true, '財務');
  public static readonly ADMIN_REPORTS = new RouteObj('reports', '/admin/reports', '報表', UserType.ADMIN, 'pi-chart-bar', true, '財務');
  public static readonly ADMIN_CAMPUSES = new RouteObj('campuses', '/admin/campuses', '分校管理', UserType.ADMIN, 'pi-building', true, '系統');
  public static readonly ADMIN_SETTINGS = new RouteObj('settings', '/admin/settings', '設定', UserType.ADMIN, 'pi-cog', true, '系統');

  // Teacher
  public static readonly TEACHER_ROOT = new RouteObj('teacher', '/teacher', '老師', UserType.TEACHER, 'pi-user', false);
  public static readonly TEACHER_DASHBOARD = new RouteObj('dashboard', '/teacher/dashboard', '儀表板', UserType.TEACHER, 'pi-home');
  public static readonly TEACHER_SCHEDULE = new RouteObj('schedule', '/teacher/schedule', '課表', UserType.TEACHER, 'pi-calendar');
  public static readonly TEACHER_ATTENDANCE = new RouteObj('attendance', '/teacher/attendance', '點名', UserType.TEACHER, 'pi-check-circle');
  public static readonly TEACHER_STUDENTS = new RouteObj('students', '/teacher/students', '學生', UserType.TEACHER, 'pi-users');
  
  // Parent
  public static readonly PARENT_ROOT = new RouteObj('parent', '/parent', '家長', UserType.PARENT, 'pi-user', false);
  public static readonly PARENT_DASHBOARD = new RouteObj('dashboard', '/parent/dashboard', '儀表板', UserType.PARENT, 'pi-home');
  public static readonly PARENT_ATTENDANCE = new RouteObj('attendance', '/parent/attendance', '出缺席', UserType.PARENT, 'pi-calendar');
  public static readonly PARENT_PAYMENTS = new RouteObj('payments', '/parent/payments', '繳費', UserType.PARENT, 'pi-wallet');
  public static readonly PARENT_COMMUNICATION = new RouteObj('communication', '/parent/communication', '聯絡簿', UserType.PARENT, 'pi-book');

  public static readonly values: RouteObj[] = [];

  public static addRoute(route: RouteObj){
    this.values.push(route);
  }

  public static findByAbsolutePath(path: string): RouteObj | undefined {
    return this.values.find((p) => p.absolutePath === path);
  }

}
