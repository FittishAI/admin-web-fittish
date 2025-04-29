import DashboardLayout from "@/components/layouts/DashboardLayout";
import QuestionnaireList from "@/components/dashboard/questionnaires/QuestionnaireList";

export default function QuestionnairesPage() {
  return (
    <DashboardLayout>
      <QuestionnaireList />
    </DashboardLayout>
  );
}
