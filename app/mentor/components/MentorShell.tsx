"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./MentorShell.module.css";
import MentorHeader from "./MentorHeader";
import { navigationItems } from "./navigation";

type MentorShellProps = {
  children: ReactNode;
  activePath?: string;
};

export default function MentorShell({ children, activePath }: MentorShellProps) {
  const pathname = usePathname();
  const resolvedActivePath = activePath || pathname || "/mentor/home";

  return (
    <div className={styles.shell}>
      <MentorHeader navItems={navigationItems} activePath={resolvedActivePath} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
