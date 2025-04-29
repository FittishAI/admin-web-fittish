import SettingsForm from '@/components/dashboard/settings/SettingForm';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <SettingsForm />
      </div>
    </DashboardLayout>
  );
}
