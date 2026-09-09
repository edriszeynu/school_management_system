// app/(dashboard)/page.tsx
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { format, subDays } from "date-fns";

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    pendingInvoices,
    recentPayments,
    recentStudents,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.class.count(),
    prisma.invoice.count({
      where: { status: { in: ["UNPAID", "OVERDUE"] } },
    }),
    prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      select: { amount: true, paymentDate: true },
    }),
    prisma.studentProfile.findMany({
      take: 20,
      orderBy: { enrollmentDate: "desc" }, // ✅ FIX: replaced "createdAt" with "enrollmentDate"
      include: {
        user: { select: { name: true, email: true } },
        class: { select: { name: true } },
      },
    }),
  ]);

  // Prepare chart data (last 30 days of fee collections)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), i);
    return format(d, "yyyy-MM-dd");
  }).reverse();

  const paymentData = last30Days.map((date) => {
    const dayPayments = recentPayments.filter(
      (p) => format(p.paymentDate, "yyyy-MM-dd") === date
    );
    return {
      date,
      amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  });

  // Prepare table data for the DataTable component
  const tableData = recentStudents.map((student) => ({
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    className: student.class?.name || "N/A",
    rollNumber: student.rollNumber || "-",
    status: "active" as const,
    enrolledAt: student.enrollmentDate.toISOString(),
  }));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                totalStudents={totalStudents}
                totalTeachers={totalTeachers}
                totalClasses={totalClasses}
                pendingInvoices={pendingInvoices}
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={paymentData} />
              </div>
              <div className="px-4 lg:px-6">
                <DataTable data={tableData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}