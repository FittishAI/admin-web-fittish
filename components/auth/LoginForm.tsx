'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FittishLogo from "@/assets/icons/FittishLogo";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (err) => {
          alert("Invalid credentials");
          console.error("Login error:", err);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-md shadow font-Inter">
      <CardContent className="py-10 px-6 space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl">
              <FittishLogo width={64} height={64} />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Fittish Admin</h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fittish.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right font-Inter text-semibold text-sm text-blue-600 mt-1 cursor-pointer">
              Forgot password?
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
