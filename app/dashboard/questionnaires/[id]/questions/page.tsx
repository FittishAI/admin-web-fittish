import QuestionBoard from "@/components/dashboard/questionnaires/QuestionBoard";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function QuestionsPage({
  params,
}: {
  params: { id: string };
}) {
  const categoryId = params.id;

  return (
    <DashboardLayout>
      <QuestionBoard categoryId={categoryId} />
    </DashboardLayout>
  );
}
