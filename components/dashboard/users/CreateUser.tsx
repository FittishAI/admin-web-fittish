'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useCreateUser } from '@/hooks/admin/useCreateUser';

const initialForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  height: '',
  weight: '',
  role: 'USER',
  isActive: 'true',
};

export default function CreateUser() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const { mutate: createUser, isPending } = useCreateUser();

  const handleSubmit = () => {
    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }
  
    createUser(
      {
        ...form,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        isActive: form.isActive === 'true',
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : null,
      },
      {
        onSuccess: () => {
          toast.success('User created successfully');
          setTimeout(() => {
            router.back();
          }, 1500);
        },
        onError: (err: any) => {
          toast.error('Error creating user', {
            description: err.message || 'Unexpected error occurred',
          });
        },
      }
    );
  };
  
  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">Create User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter User Details</CardTitle>
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
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Secure password"
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
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={form.height}
                onChange={(e) => handleChange('height', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) => handleChange('role', value)}
              >
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
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
