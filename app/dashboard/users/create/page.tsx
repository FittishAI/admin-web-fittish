import DashboardLayout from '@/components/layouts/DashboardLayout';
import CreateUser from '@/components/dashboard/users/CreateUser';

export default function EditUserPage() {
  return (
    <DashboardLayout>
      <CreateUser />
    </DashboardLayout>
  );
}