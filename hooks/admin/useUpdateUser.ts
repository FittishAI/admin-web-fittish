import { API_URL } from '@/constants';
import { useMutation } from '@tanstack/react-query';

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
  });
};
