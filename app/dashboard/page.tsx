import DashboardLayout from "@/components/layouts/DashboardLayout";

import SummaryCards from "@/components/dashboard/SummaryCards";
import RecentUsers from "@/components/dashboard/RecentUsers";
import YourProfileCard from "@/components/dashboard/YourProfileCard";
import RecentQuestionnaires from "@/components/dashboard/RecentQuestionaires";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <SummaryCards />
      <RecentQuestionnaires />
      <RecentUsers />
      <YourProfileCard />
    </DashboardLayout>
  );
}
