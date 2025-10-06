import type { Metadata } from "next";

import "./dashboard.css";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Business Revenue Model App",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
