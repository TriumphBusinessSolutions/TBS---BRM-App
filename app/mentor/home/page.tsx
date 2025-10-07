import type { Metadata } from "next";

import MentorHomeView from "../components/MentorHomeView";
import { loadMentorDashboardData } from "../dashboard-data";

export const metadata: Metadata = {
  title: "Mentor Dashboard | Triumph BRM App",
};

export default async function MentorHomePage() {
  const data = await loadMentorDashboardData();
  return <MentorHomeView {...data} />;
}
