import DashboardLayout from '@/components/layouts/DashboardLayout';
import CreateQuestionnaireComponent from '@/components/dashboard/questionnaires/CreateQuestionnaire';

export default function CreateQuestionnairePage() {
  return (
    <DashboardLayout>
      <CreateQuestionnaireComponent />
    </DashboardLayout>
  );
}
