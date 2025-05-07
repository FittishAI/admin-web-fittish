import { API_URL } from '@/constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create user');
      }

      return res.json();
    },
  });
};
