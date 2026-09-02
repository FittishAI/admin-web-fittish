import DashboardLayout from '@/components/layouts/DashboardLayout';
import PromoCodesTable from '@/components/dashboard/promo-codes/PromoCodesTable';

export default function PromoCodesRoutePage() {
  return (
    <DashboardLayout>
      <PromoCodesTable />
    </DashboardLayout>
  );
}
