import TokenUsageTable from '@/components/dashboard/token-usage/TokenUsageTable';
import OpenAiCostsCard from '@/components/dashboard/token-usage/OpenAiCostsCard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function TokenUsageRoutePage() {
  return (
    <DashboardLayout>
      <OpenAiCostsCard />
      <TokenUsageTable />
    </DashboardLayout>
  );
}