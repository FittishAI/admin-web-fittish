import QuestionBoard from "@/components/dashboard/questionnaires/QuestionBoard";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function QuestionsPage() {
  return (
    <DashboardLayout>
      <QuestionBoard/>
    </DashboardLayout>
  );
}
