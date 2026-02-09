import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly badge?: number;
  readonly group?: string;
}

interface NavGroup {
  readonly label?: string;
  readonly items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly navItems = input<NavItem[]>([]);

  protected get groupedNav(): NavGroup[] {
    const items = this.navItems();
    const ungrouped: NavItem[] = [];
    const groupMap = new Map<string, NavItem[]>();

    for (const item of items) {
      if (item.group) {
        if (!groupMap.has(item.group)) groupMap.set(item.group, []);
        groupMap.get(item.group)!.push(item);
      } else {
        ungrouped.push(item);
      }
    }

    const groups: NavGroup[] = [];
    if (ungrouped.length > 0) groups.push({ items: ungrouped });
    for (const [label, groupItems] of groupMap) {
      groups.push({ label, items: groupItems });
    }
    return groups;
  }
}
