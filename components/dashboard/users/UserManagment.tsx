'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2, Search, UserPlus, CheckCircle, XCircle, Dumbbell, UtensilsCrossed, Flame } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllUsers } from '@/hooks/admin/useGetAllUsers';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { AdminUser } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/format';

const getRoleBadge = (role?: string) => {
  const safeRole = role || 'user';
  const roleFormatted =
    safeRole.charAt(0).toUpperCase() + safeRole.slice(1).toLowerCase();

  const variant =
    safeRole.toLowerCase() === 'admin'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variant}`}>
      {roleFormatted}
    </span>
  );
};

const getPlanBadge = (planName?: string | null) => {
  const plan = planName ?? 'FREE';
  const upper = plan.toUpperCase();
  const variant =
    upper === 'PREMIUM'
      ? 'bg-amber-100 text-amber-700'
      : upper === 'FREE'
        ? 'bg-sky-100 text-sky-700'
        : 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variant}`}>
      {plan}
    </span>
  );
};

const StatCell = ({ value }: { value: number }) => (
  <span className="font-medium text-slate-700">{value}</span>
);

const QuotaCell = ({
  used,
  limit,
  generated,
}: {
  used?: number | null;
  limit?: number | null;
  generated: number;
}) => {
  if (typeof used !== 'number' || typeof limit !== 'number') {
    return <span className="font-medium text-slate-700">{generated}</span>;
  }
  const spent = used >= limit;
  return (
    <span
      className={`font-medium tabular-nums ${spent ? 'text-amber-600' : 'text-slate-700'}`}
      title={`${used} of ${limit} used this period · ${generated} generated all-time`}
    >
      {used}/{limit}
    </span>
  );
};

const PAGE_SIZE = 20;

export default function UserManagment() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  // Debounce so each keystroke doesn't fire a server query.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useGetAllUsers({
    offset,
    limit: PAGE_SIZE,
    search,
  });
  const { mutate: deleteUser } = useDeleteUser();

  const users: AdminUser[] = data?.items ?? [];
  const total = data?.total ?? 0;

  const rangeStart = total === 0 ? 0 : Math.min(offset + 1, total);
  const rangeEnd = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const handleDelete = (id: string, name: string) => {
    deleteUser(id, {
      onSuccess: () => {
        toast.success('User deleted', {
          description: name,
        });
        setOpenDialogId(null);
      },
      onError: (err: any) => {
        toast.error('Failed to delete', {
          description: err.message || 'Unexpected error',
        });
      },
    });
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all registered users.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/users/create')}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add User
        </Button>
      </div>

      <div className="relative max-w-md bg-white dark:bg-slate-800 border border-gray-200 rounded-md shadow-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or role..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            {/* Row 1 — top-level headers; grouped columns use colSpan, fixed columns use rowSpan */}
            <TableRow className="bg-muted">
              <TableHead rowSpan={2} className="w-[150px] align-middle">Name</TableHead>
              <TableHead rowSpan={2} className="align-middle">Email</TableHead>
              <TableHead rowSpan={2} className="align-middle">Role</TableHead>
              <TableHead rowSpan={2} className="align-middle">Status</TableHead>
              <TableHead rowSpan={2} className="align-middle">Onboarded</TableHead>
              <TableHead rowSpan={2} className="align-middle">Walkthrough</TableHead>
              <TableHead rowSpan={2} className="align-middle whitespace-nowrap">Last App Open</TableHead>
              <TableHead
                rowSpan={2}
                className="align-middle whitespace-nowrap"
                title="Newest session activity — written on sign-in and on every token refresh"
              >
                Last Session
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-center border-l border-orange-200 bg-orange-50/60 text-orange-800 font-semibold"
              >
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  Streak
                </div>
              </TableHead>
              <TableHead
                colSpan={3}
                className="text-center border-l border-blue-200 bg-blue-50/60 text-blue-800 font-semibold"
              >
                Plans
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-center border-l border-green-200 bg-green-50/60 text-green-800 font-semibold"
              >
                Logged
              </TableHead>
              <TableHead rowSpan={2} className="text-right align-middle border-l">Actions</TableHead>
            </TableRow>
            {/* Row 2 — sub-headers for all grouped sections */}
            <TableRow className="bg-muted">
              <TableHead className="text-xs text-muted-foreground border-l border-orange-200">Current</TableHead>
              <TableHead className="text-xs text-muted-foreground">Longest</TableHead>
              <TableHead className="text-xs text-muted-foreground border-l border-blue-200">Plan</TableHead>
              <TableHead className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />Workout</div>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" />Meal</div>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground border-l border-green-200">
                <div className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />Workout</div>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" />Meal</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(15)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  onClick={() =>
                    router.push(`/dashboard/users/${user.id}/view`)
                  }
                  className="cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.onboardingCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    {typeof user.walkthroughCompleted === 'number' &&
                      typeof user.walkthroughTotal === 'number' ? (
                      <span
                        className={`text-sm font-medium tabular-nums ${user.walkthroughCompleted === user.walkthroughTotal
                          ? 'text-green-600'
                          : user.walkthroughCompleted > 0
                            ? 'text-slate-700'
                            : 'text-gray-400'
                          }`}
                      >
                        {user.walkthroughCompleted}/{user.walkthroughTotal}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {formatDate(user.lastAppOpenAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  {/* Streak group */}
                  <TableCell className="border-l border-orange-100">
                    <span className={`inline-flex items-center gap-1 font-medium ${user.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                      <Flame className="w-3.5 h-3.5" />
                      {user.currentStreak}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 font-medium ${user.longestStreak > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                      <Flame className="w-3.5 h-3.5" />
                      {user.longestStreak}
                    </span>
                  </TableCell>
                  {/* Plans group */}
                  <TableCell className="border-l border-blue-100">{getPlanBadge(user.planName)}</TableCell>
                  <TableCell>
                    <QuotaCell
                      used={user.workoutPlanUsage}
                      limit={user.workoutPlanLimit}
                      generated={user.workoutPlansGenerated}
                    />
                  </TableCell>
                  <TableCell>
                    <QuotaCell
                      used={user.mealPlanUsage}
                      limit={user.mealPlanLimit}
                      generated={user.mealPlansGenerated}
                    />
                  </TableCell>
                  {/* Logged group */}
                  <TableCell className="border-l border-green-100">
                    <StatCell value={user.workoutsLogged} />
                  </TableCell>
                  <TableCell>
                    <StatCell value={user.mealsLogged} />
                  </TableCell>
                  <TableCell className="text-right border-l">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/users/${user.id}/view`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/users/${user.id}/edit`);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {user.role !== 'ADMIN' && (
                        <Dialog
                          open={openDialogId === String(user.id)}
                          onOpenChange={(open) =>
                            setOpenDialogId(open ? String(user.id) : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent onClick={(e) => e.stopPropagation()}>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                              Are you sure you want to delete{' '}
                              <strong>
                                {user.firstName} {user.lastName}
                              </strong>
                              ? This action cannot be undone.
                            </p>
                            <DialogFooter className="pt-4">
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDialogId(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(
                                    String(user.id),
                                    `${user.firstName} ${user.lastName}`
                                  );
                                }}
                              >
                                Confirm Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={16}
                  className="text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Server-side pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart}–{rangeEnd} of {formatNumber(total)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev || isLoading}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            ‹ Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext || isLoading}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next ›
          </Button>
        </div>
      </div>
    </section>
  );
}
