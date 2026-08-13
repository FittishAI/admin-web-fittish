import { API_URL } from "@/constants";
import { useAuthStore, type AuthUser } from "@/lib/store/authSlice";
import { useMutation } from "@tanstack/react-query";
import { getDeviceId } from "@/lib/utils";

type SignInResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
};

type LoginResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();

    if (body?.errorCode === "EMAIL_NOT_VERIFIED") {
      return "This email is not verified yet. Verify it before signing in.";
    }

    const message: unknown = body?.message ?? body?.error;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  } catch {
    // Non-JSON body — fall through to the status-based default.
  }

  return res.status === 401 ? "Invalid email or password" : "Sign in failed";
}

const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResult> => {
  const deviceId = getDeviceId();

  const res = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, deviceId }),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));

  const data: SignInResponse = await res.json();

  if (!data.access_token || !data.refresh_token || !data.user) {
    throw new Error("Sign in response was incomplete");
  }

  if (data.user.role !== "ADMIN") {
    throw new Error("This account does not have admin access");
  }

  return {
    user: data.user,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    deviceId,
  };
};

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: ({ user, accessToken, refreshToken, deviceId }) => {
      setAuth(user, accessToken, refreshToken, deviceId);
    },
  });
}
