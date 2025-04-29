import RecentQuestionnaires from "@/components/dashboard/RecentQuestionaires";
import RecentUsers from "@/components/dashboard/RecentUsers";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <RecentQuestionnaires />
      <RecentUsers />
    </DashboardLayout>
  );
}
