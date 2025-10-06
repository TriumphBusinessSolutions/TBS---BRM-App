"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import DashboardHeader from "./DashboardHeader";
import styles from "./ClientShell.module.css";
import { navigationItems } from "./navigation";

type ClientShellProps = {
  children: ReactNode;
  activePath?: string;
};

export default function ClientShell({ children, activePath }: ClientShellProps) {
  const pathname = usePathname();
  const resolvedActivePath = activePath || pathname || "/client";

  return (
    <div className={styles.shell}>
      <DashboardHeader navItems={navigationItems} activePath={resolvedActivePath} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
