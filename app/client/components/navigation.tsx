import type { ReactNode } from "react";

import { HomeIcon, LayersIcon, SparkleIcon, UsersIcon } from "./icons";

export type NavItem = {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
};

export const navigationItems: NavItem[] = [
  {
    label: "Home",
    description: "Your active Triumph status and next actions.",
    href: "/client",
    icon: <HomeIcon />,
  },
  {
    label: "Model Generation",
    description: "Shape strategies and build your growth models.",
    href: "/client#model-generation",
    icon: <SparkleIcon />,
  },
  {
    label: "Model Implementation",
    description: "Track milestones and KPIs as you execute.",
    href: "/client#model-implementation",
    icon: <LayersIcon />,
  },
  {
    label: "Mentor Outreach",
    description: "Stay in sync with your Triumph mentor team.",
    href: "/client#mentor-outreach",
    icon: <UsersIcon />,
  },
];
