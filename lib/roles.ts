export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export function getDashboardPath(role?: string) {
  switch (role) {
    case "TEACHER":
      return "/dashboard/teacher";
    case "STUDENT":
      return "/dashboard/student";
    case "PARENT":
      return "/dashboard/parent";
    case "ACCOUNTANT":
      return "/dashboard/fees";
    default:
      return "/dashboard";
  }
}