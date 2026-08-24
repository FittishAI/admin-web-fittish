'use client';

import { useRouter } from 'next/navigation';
import {
  Users,
  Activity,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetDashboardStats } from '@/hooks/admin/useGetDashboardStats';
import type { DashboardStats } from '@/lib/types';
import StatTile from '@/components/dashboard/StatTile';
import {
  formatDate,
  formatNumber,
  formatUtcDayLong,
  formatUtcDayShort,
} from '@/lib/format';

/** Brand blue from the Fittish logo — validated for chart use on light surface. */
const CHART_BLUE = '#2483FB';

/* ---------------------------------- chart --------------------------------- */

const SignupsChart = ({ data }: { data: DashboardStats['signupsByDay'] }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">Signups — last 30 days</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatUtcDayShort}
              interval={6}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
              labelFormatter={(d) => formatUtcDayLong(String(d))}
              formatter={(value) => [formatNumber(Number(value)), 'Signups']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={CHART_BLUE}
              strokeWidth={2}
              fill={CHART_BLUE}
              fillOpacity={0.12}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

/* ---------------------------------- funnel -------------------------------- */

const FunnelRow = ({
  label,
  value,
  max,
  isBaseline = false,
}: {
  label: string;
  value: number;
  max: number;
  isBaseline?: boolean;
}) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
          {isBaseline && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
              Baseline
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {isBaseline ? `${formatNumber(value)} users` : `${formatNumber(value)} of ${formatNumber(max)} users`}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
              isBaseline
                ? 'bg-slate-100 text-slate-600'
                : 'bg-blue-50 text-[#2483FB] border border-blue-100'
            }`}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isBaseline ? 'bg-slate-300' : 'bg-[#2483FB]'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
};

const OnboardingFunnel = ({
  funnel,
}: {
  funnel: DashboardStats['funnel'];
}) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base">Onboarding Funnel</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            User conversion stages relative to total signups ({formatNumber(funnel.signedUp)})
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0 divide-y-0">
      <FunnelRow
        label="Signed Up"
        value={funnel.signedUp}
        max={funnel.signedUp}
        isBaseline
      />
      <FunnelRow
        label="Assessment Completed"
        value={funnel.assessmentCompleted}
        max={funnel.signedUp}
      />
      <FunnelRow
        label="Onboarding Completed"
        value={funnel.planRequested}
        max={funnel.signedUp}
      />
      <FunnelRow
        label="Plan Generated"
        value={funnel.planGenerated}
        max={funnel.signedUp}
      />
    </CardContent>
  </Card>
);

/* ------------------------------- recent users ----------------------------- */

const RecentUsers = ({
  users,
}: {
  users: DashboardStats['recentUsers'];
}) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Users</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 divide-y divide-gray-100">
        {users.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">No users yet.</p>
        )}
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => router.push(`/dashboard/users/${user.id}/view`)}
            className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-gray-50 rounded-md px-1 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user.name
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(user.createdAt)}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

/* --------------------------------- overview ------------------------------- */

export default function DashboardOverview() {
  const { data, isLoading, isError } = useGetDashboardStats();

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total Users"
          value={data?.totals.users ?? 0}
          icon={Users}
          loading={isLoading}
        />
        <StatTile
          label="Active Users (7d)"
          value={data?.totals.activeUsers7d ?? 0}
          icon={Activity}
          loading={isLoading}
        />
        <StatTile
          label="Onboarded"
          value={data?.totals.onboarded ?? 0}
          icon={CheckCircle2}
          loading={isLoading}
        />
        <StatTile
          label="New This Week"
          value={data?.totals.newThisWeek ?? 0}
          icon={UserPlus}
          loading={isLoading}
        />
      </div>

      {isError && (
        <p className="text-sm text-red-600">
          Could not load dashboard stats.
        </p>
      )}

      {isLoading && !data && <Skeleton className="h-56 w-full" />}

      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SignupsChart data={data.signupsByDay} />
            <OnboardingFunnel funnel={data.funnel} />
          </div>
          <RecentUsers users={data.recentUsers} />
        </>
      )}
    </section>
  );
}
