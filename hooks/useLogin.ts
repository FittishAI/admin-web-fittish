import { API_URL } from "@/constants";
import { useAuthStore } from "@/lib/store/authSlice";
import { useMutation } from "@tanstack/react-query";

const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json(); // expects { user, token }
};

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
        console.log("Login success response:", data);
        localStorage.setItem("token", data.access_token);
        setAuth(data.user, data.access_token);
      }           
  });
}
