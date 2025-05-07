'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2, Search, UserPlus } from 'lucide-react';

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

export default function UserManagment() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useGetAllUsers();
  const { mutate: deleteUser } = useDeleteUser();

  const filtered = users.filter((user: any) =>
    [user.email, user.firstName, user.lastName, user.role]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[160px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(4)].map((_, j) => (
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
            ) : filtered.length > 0 ? (
              filtered.map((user: any) => (
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/users/${user.id}/view`)
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
                          router.push(`/dashboard/users/${user.id}/edit`)
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Dialog
                        open={openDialogId === user.id}
                        onOpenChange={(open) =>
                          setOpenDialogId(open ? user.id : null)
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
                                  user.id,
                                  `${user.firstName} ${user.lastName}`
                                );
                              }}
                            >
                              Confirm Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
