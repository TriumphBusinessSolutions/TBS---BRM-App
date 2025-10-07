import type { ReactNode } from "react";

import { BookIcon, ChatIcon, HomeIcon, UsersIcon } from "./icons";

export type NavItem = {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
};

export const navigationItems: NavItem[] = [
  {
    label: "Home",
    description: "Monitor live client activity and stay ahead of their needs.",
    href: "/mentor/home",
    icon: <HomeIcon />,
  },
  {
    label: "Assigned Clients",
    description: "Review the businesses you’re actively guiding.",
    href: "/mentor/assigned-clients",
    icon: <UsersIcon />,
  },
  {
    label: "Session Notes",
    description: "Capture insights and prep for upcoming meetings.",
    href: "/mentor/session-notes",
    icon: <ChatIcon />,
  },
  {
    label: "Resource Library",
    description: "Access Triumph playbooks, templates, and guides.",
    href: "/mentor/resource-library",
    icon: <BookIcon />,
  },
];
