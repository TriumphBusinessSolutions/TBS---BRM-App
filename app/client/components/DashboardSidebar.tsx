"use client";

import Link from "next/link";

import Icon from "./Icon";
import styles from "./DashboardSidebar.module.css";
import type { NavItem } from "./navigation";

type DashboardSidebarProps = {
  navItems: NavItem[];
  activePath: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
};

export default function DashboardSidebar({
  navItems,
  activePath,
  activeSection,
  onSectionChange,
}: DashboardSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <span className={styles.sectionLabel}>Navigate</span>
      <div className={styles.navList}>
        {navItems.map((item) => {
          const normalizedHref = item.href.split("#")[0];
          const isAnchor = item.href.includes("#");
          const isActive = isAnchor
            ? activeSection === item.href
            : activePath === item.href || activePath === normalizedHref;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`.trim()}
              onClick={() => {
                if (isAnchor) {
                  onSectionChange(item.href);
                }
              }}
            >
              <span className={styles.navItemIcon}>
                <Icon size="sm" aria-hidden>
                  {item.icon}
                </Icon>
              </span>
              <span className={styles.navItemLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
