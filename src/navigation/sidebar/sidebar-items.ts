import { BookOpen, Folder, Home, type LucideIcon, Search, Trash2, Users } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  action?: "search"; // Special action items
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Search",
        url: "#",
        icon: Search,
        action: "search",
      },
    ],
  },
  {
    id: 2,
    label: "Workspace",
    items: [
      {
        title: "Home",
        url: "/dashboard/default",
        icon: Home,
      },
      {
        title: "All Projects",
        url: "/dashboard/projects",
        icon: Folder,
      },
      {
        title: "Resources",
        url: "/dashboard/resources",
        icon: BookOpen,
      },
    ],
  },
  {
    id: 3,
    label: "Team",
    items: [
      {
        title: "Team Projects",
        url: "/dashboard/team",
        icon: Users,
      },
    ],
  },
  {
    id: 4,
    items: [
      {
        title: "Trash",
        url: "/dashboard/trash",
        icon: Trash2,
      },
    ],
  },
];
