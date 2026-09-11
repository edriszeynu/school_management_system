// app/dashboard/parent/children/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarCheck, DollarSign, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ParentChildrenPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const parentRelations = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        include: {
          user: true,
          class: { include: { academicYear: true } },
        },
      },
    },
  });

  if (parentRelations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="rounded-full bg-muted p-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">No children linked</h2>
        <p className="text-sm text-muted-foreground">Please contact the school administrator.</p>
      </div>
    );
  }

  const studentIds = parentRelations.map((r) => r.student.id);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [allGrades, allAttendance, allInvoices] = await Promise.all([
    prisma.grade.findMany({ where: { studentId: { in: studentIds } } }),
    prisma.attendance.findMany({
      where: { studentId: { in: studentIds }, date: { gte: thirtyDaysAgo } },
    }),
    prisma.invoice.findMany({
      where: { studentId: { in: studentIds }, status: { in: ["UNPAID", "OVERDUE"] } },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
          <p className="text-sm text-muted-foreground">
            Overview of all children linked to your account.
          </p>
        </div>
      </div>

      {/* Children Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {parentRelations.map(({ student, relation }) => {
          const grades = allGrades.filter((g) => g.studentId === student.id);
          const attendance = allAttendance.filter((a) => a.studentId === student.id);
          const invoices = allInvoices.filter((i) => i.studentId === student.id);
          const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
          const attendancePct =
            attendance.length > 0
              ? Math.round((presentDays / attendance.length) * 100)
              : 0;
          const overallAvg =
            grades.length > 0
              ? Math.round(
                  (grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length) * 10
                ) / 10
              : null;
          const totalUnpaid = invoices.reduce((sum: number, i: any) => sum + i.amount, 0);

          const stats = [
            {
              label: "Overall Avg",
              value: overallAvg !== null ? `${overallAvg}%` : "N/A",
              icon: TrendingUp,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              label: "Attendance",
              value: `${attendancePct}%`,
              icon: CalendarCheck,
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              label: "Grades",
              value: grades.length,
              icon: BookOpen,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Pending Fees",
              value: totalUnpaid > 0 ? `$${totalUnpaid.toFixed(2)}` : "All Paid",
              icon: DollarSign,
              color: totalUnpaid > 0 ? "text-red-500" : "text-green-500",
              bg: totalUnpaid > 0 ? "bg-red-500/10" : "bg-green-500/10",
              valueColor: totalUnpaid > 0 ? "text-red-500" : "text-green-500",
            },
          ];

          return (
            <div
              key={student.id}
              className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="relative px-6 pt-6 pb-4">
                {/* Decorative gradient bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-t-2xl" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                        {student.user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold leading-tight">{student.user.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {student.class?.name} – {student.class?.section}
                        {student.rollNumber ? ` • Roll: ${student.rollNumber}` : ""}
                      </p>
                      {student.class?.academicYear && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {student.class.academicYear.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {relation}
                  </Badge>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-border" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 p-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("rounded-lg p-1.5", stat.bg)}>
                        <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-2xl font-bold tracking-tight",
                        (stat as any).valueColor || ""
                      )}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
