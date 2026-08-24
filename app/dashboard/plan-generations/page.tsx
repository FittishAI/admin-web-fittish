import PlanGenerationsTable from '@/components/dashboard/plan-generations/PlanGenerationsTable';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function PlanGenerationsRoutePage() {
  return (
    <DashboardLayout>
      <PlanGenerationsTable />
    </DashboardLayout>
  );
}
