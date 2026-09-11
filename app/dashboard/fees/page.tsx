// app/(dashboard)/fees/page.tsx
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FeesPage() {
  // Fetch invoices with relations
  const invoices = await prisma.invoice.findMany({
    include: {
      student: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      feeStructure: {
        select: { name: true },
      },
      payments: {
        select: { amount: true },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  // Calculate summary stats
  const totalUnpaid = invoices
    .filter((inv) => inv.status === "UNPAID" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;
  const unpaidCount = invoices.filter(
    (inv) => inv.status === "UNPAID" || inv.status === "OVERDUE"
  ).length;

  // Shape data for DataTable
  const tableData = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    studentName: inv.student?.user?.name || "N/A",
    feeName: inv.feeStructure?.name || "N/A",
    amount: inv.amount,
    dueDate: inv.dueDate.toISOString(),
    status: inv.status,
    paidAmount: inv.payments.reduce((sum, p) => sum + p.amount, 0),
    issueDate: inv.issueDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold tracking-tight">Fees & Invoices</h1>
          <p className="text-muted-foreground">
            Manage all student invoices and payments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/fees/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalUnpaid.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {unpaidCount} invoice{unpaidCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalOverdue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaid.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidCount} invoice{paidCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}