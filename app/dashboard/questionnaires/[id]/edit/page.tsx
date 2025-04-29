"use client";

import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import EditQuestionnaire from "@/components/dashboard/questionnaires/EditQuestionnaire";

export default function EditQuestionnairePage() {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <EditQuestionnaire id={id as string} />
    </DashboardLayout>
  );
}
