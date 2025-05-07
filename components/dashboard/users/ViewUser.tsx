'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftCircle } from 'lucide-react';

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
              <Input value={user.firstName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user.lastName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={user.dateOfBirth?.split('T')[0] || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={user.height} disabled />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={user.weight} disabled />
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
    </div>
  );
}
