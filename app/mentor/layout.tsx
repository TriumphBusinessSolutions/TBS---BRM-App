import type { ReactNode } from "react";

import MentorShell from "./components/MentorShell";

export default function MentorLayout({ children }: { children: ReactNode }) {
  return <MentorShell>{children}</MentorShell>;
}
