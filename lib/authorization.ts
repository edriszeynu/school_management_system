import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as UserRole | undefined;

  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!role || !allowedRoles.includes(role)) throw new Error("Forbidden");

  return session as typeof session & { user: { id: string } };
}