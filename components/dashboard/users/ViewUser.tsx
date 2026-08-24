'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftCircle,
  CheckCircle,
  XCircle,
  Flame,
  Dumbbell,
  UtensilsCrossed,
  Smartphone,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useGetUser } from '@/hooks/admin/useGetUser';
import { formatDate } from '@/lib/format';

const withUnit = (
  value?: string | null,
  unit?: string | null
): string => {
  if (!value) return '';
  if (unit && !value.includes(unit)) return `${value} ${unit}`;
  return value;
};

const screenLabel = (key: string): string =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const StatusIcon = ({ done }: { done: boolean }) =>
  done ? (
    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
  ) : (
    <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
  );

const StatusRow = ({ label, done }: { label: string; done: boolean }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-slate-700">{label}</span>
    <StatusIcon done={done} />
  </div>
);

const ActivityStat = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-md border border-gray-100 p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    <div className="text-lg font-semibold text-slate-800">{value}</div>
  </div>
);

export default function ViewUser() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const { data: user, isLoading } = useGetUser(id);

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading user...</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">User not found</div>;
  }

  const onboarding = user.onboarding;
  const walkthrough = user.walkthrough as
    | { key: string; completed: boolean }[]
    | undefined;
  const activity = user.activity;

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">View User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={user.firstName ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user.lastName ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="text" value={user.age ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                type="text"
                value={withUnit(user.height, user.heightUnit)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input
                type="text"
                value={withUnit(user.weight, user.weightUnit)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={user.role} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={user.isActive ? 'true' : 'false'} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding — the product definition (assessment + initial plan), NOT
          the tutorial. Rendered only when the backend provides it, so an older
          backend can never crash this page. */}
      {onboarding && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <StatusRow
                label="Basic (profile)"
                done={onboarding.basicComplete}
              />
              <StatusRow
                label="Workout answers"
                done={onboarding.workoutAnswered}
              />
              <StatusRow
                label="Meal answers"
                done={onboarding.mealAnswered}
              />
              <StatusRow
                label="Onboarding Completed"
                done={onboarding.initialPlanRequested}
              />
              <StatusRow
                label="Plan Generated"
                done={onboarding.planGenerated}
              />
            </CardContent>
          </Card>

          {/* Walkthrough tutorial progress — informational, separate from
              onboarding on purpose. */}
          {walkthrough && walkthrough.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Walkthrough</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100">
                {walkthrough.map((screen) => (
                  <StatusRow
                    key={screen.key}
                    label={screenLabel(screen.key)}
                    done={screen.completed}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ActivityStat
                label="Current Streak"
                value={activity.currentStreak}
                icon={Flame}
              />
              <ActivityStat
                label="Longest Streak"
                value={activity.longestStreak}
                icon={Flame}
              />
              <ActivityStat
                label="Workout Plans"
                value={activity.workoutPlansGenerated}
                icon={Dumbbell}
              />
              <ActivityStat
                label="Meal Plans"
                value={activity.mealPlansGenerated}
                icon={UtensilsCrossed}
              />
              <ActivityStat
                label="Workouts Logged"
                value={activity.workoutsLogged}
                icon={Dumbbell}
              />
              <ActivityStat
                label="Meals Logged"
                value={activity.mealsLogged}
                icon={UtensilsCrossed}
              />
              <ActivityStat
                label="App Opens"
                value={activity.appOpenCount}
                icon={Smartphone}
              />
              <ActivityStat
                label="Last App Open"
                value={formatDate(activity.lastAppOpenAt)}
                icon={Smartphone}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
