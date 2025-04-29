import UserManagment from '@/components/dashboard/users/UserManagment';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function UsersRoutePage() {
  return (
    <DashboardLayout>
        <UserManagment/>
    </DashboardLayout>
  );
}
