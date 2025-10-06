"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import styles from "./ClientShell.module.css";
import { navigationItems } from "./navigation";

type ClientShellProps = {
  children: ReactNode;
  activePath?: string;
};

export default function ClientShell({ children, activePath }: ClientShellProps) {
  const pathname = usePathname();
  const resolvedActivePath = activePath || pathname || "/client";
  const [activeSection, setActiveSection] = useState<string>("");
  const activeSectionRef = useRef(activeSection);
  const anchoredItems = useMemo(() => navigationItems.filter((item) => item.href.includes("#")), []);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleHashChange = () => {
      setActiveSection(window.location.hash ? `/client${window.location.hash}` : "");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          const matched = anchoredItems.find((item) => item.href.endsWith(`#${visible[0].target.id}`));
          if (matched && matched.href !== activeSectionRef.current) {
            setActiveSection(matched.href);
          }
        }
      },
      { rootMargin: "-45% 0px -45%" },
    );

    anchoredItems.forEach((item) => {
      const [, hash] = item.href.split("#");
      if (!hash) return;
      const target = document.getElementById(hash);
      if (target) {
        observer.observe(target);
      }
    });

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      observer.disconnect();
    };
  }, [anchoredItems]);

  return (
    <div className={styles.shell}>
      <DashboardHeader
        navItems={navigationItems}
        activePath={resolvedActivePath}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <DashboardSidebar
            navItems={navigationItems}
            activePath={resolvedActivePath}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
