import { User } from "@/lib/types";

export const users: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@fittish.com",
    role: "admin",
    createdAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "u2",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    createdAt: "2023-02-20T14:30:00Z",
  },
  {
    id: "u3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    createdAt: "2023-03-10T09:15:00Z",
  },
];