"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Icon from "./Icon";
import styles from "./MentorHeader.module.css";
import type { NavItem } from "./navigation";
import { ArrowIcon, CogIcon } from "./icons";

type MentorHeaderProps = {
  navItems: NavItem[];
  activePath: string;
};

export default function MentorHeader({ navItems, activePath }: MentorHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>TM</span>
        <span>Triumph Mentor Workspace</span>
      </div>
      <nav className={styles.nav} aria-label="Mentor navigation">
        {navItems.map((item) => {
          const normalizedHref = item.href.endsWith("/") ? item.href.slice(0, -1) : item.href;
          const normalizedActivePath = activePath.endsWith("/") ? activePath.slice(0, -1) : activePath;
          const matchesExact = normalizedActivePath === normalizedHref;
          const matchesNested = normalizedActivePath.startsWith(`${normalizedHref}/`);
          const isActive = matchesExact || matchesNested;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navButton} ${isActive ? styles.navButtonActive : ""}`.trim()}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.utilities}>
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            className={styles.menuButton}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <Icon size="sm" aria-hidden>
              <CogIcon />
            </Icon>
            <span className="sr-only">Open settings</span>
          </button>
          {menuOpen ? (
            <div role="menu" className={styles.dropdown}>
              {[
                { label: "Account Settings", href: "/settings" },
                { label: "Mentor Preferences", href: "/mentor/settings" },
                { label: "Log Out", href: "/logout" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <Icon size="sm" aria-hidden>
                    <ArrowIcon />
                  </Icon>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
