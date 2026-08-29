import FreeTrialGrantsTable from '@/components/dashboard/free-trials/FreeTrialGrantsTable';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function FreeTrialsRoutePage() {
  return (
    <DashboardLayout>
      <FreeTrialGrantsTable />
    </DashboardLayout>
  );
}
