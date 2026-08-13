import TokenUsageTable from '@/components/dashboard/token-usage/TokenUsageTable';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function TokenUsageRoutePage() {
  return (
    <DashboardLayout>
      <TokenUsageTable />
    </DashboardLayout>
  );
}
