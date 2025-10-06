import type { ReactNode } from "react";

import styles from "./Icon.module.css";

type IconProps = {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-hidden"?: boolean;
};

export default function Icon({ children, size = "md", className, "aria-hidden": ariaHidden }: IconProps) {
  const sizeClass =
    size === "sm" ? styles["size-sm"] : size === "lg" ? styles["size-lg"] : styles["size-md"];

  return (
    <span className={`${styles.icon} ${sizeClass} ${className ?? ""}`.trim()} aria-hidden={ariaHidden}>
      {children}
    </span>
  );
}
