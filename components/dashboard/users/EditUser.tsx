'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeftCircle, Save } from 'lucide-react';

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
import { useUpdateUser } from '@/hooks/admin/useUpdateUser';

export default function EditUser() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const { data: user, isLoading } = useGetUser(id);
  const { mutate: updateUser, isPending } = useUpdateUser();

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    age: '',
    height: '',
    weight: '',
    role: 'USER',
    isActive: 'true',
  });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age != null ? String(user.age) : '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        role: user.role || 'USER',
        isActive: user.isActive ? 'true' : 'false',
      });
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    updateUser(
      {
        id,
        data: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          age: form.age ? parseInt(form.age, 10) : undefined,
          height: form.height || undefined,
          weight: form.weight || undefined,
          role: form.role,
          isActive: form.isActive === 'true',
        },
      },
      {
        onSuccess: () => {
          toast.success('User updated successfully');
          router.push('/dashboard/users');
        },
        onError: (err: any) => {
          toast.error('Failed to update user', {
            description: err.message || 'Something went wrong',
          });
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading user...</div>;
  }

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">Edit User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Height{user?.heightUnit ? ` (${user.heightUnit})` : ''}</Label>
              <Input
                type="text"
                value={form.height}
                onChange={(e) => handleChange('height', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight{user?.weightUnit ? ` (${user.weightUnit})` : ''}</Label>
              <Input
                type="text"
                value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
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
              <Select
                value={form.isActive}
                onValueChange={(value) => handleChange('isActive', value)}
              >
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

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
