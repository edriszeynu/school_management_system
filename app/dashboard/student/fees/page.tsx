// app/dashboard/student/fees/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function StudentFeesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get student profile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      class: true,
    },
  });

  if (!studentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Student profile not found.</p>
      </div>
    );
  }

  // Fetch invoices
  const invoices = await prisma.invoice.findMany({
    where: { studentId: studentProfile.id },
    include: {
      feeStructure: true,
      payments: true,
    },
    orderBy: { dueDate: "desc" },
  });

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalUnpaid = invoices
    .filter((inv) => inv.status === "UNPAID" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const statusCounts = {
    PAID: invoices.filter((inv) => inv.status === "PAID").length,
    UNPAID: invoices.filter((inv) => inv.status === "UNPAID").length,
    OVERDUE: invoices.filter((inv) => inv.status === "OVERDUE").length,
    PARTIAL: invoices.filter((inv) => inv.status === "PARTIAL").length,
    WAIVED: invoices.filter((inv) => inv.status === "WAIVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/student">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Status</h1>
          <p className="text-muted-foreground">
            View all your invoices and payment history
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaid.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{statusCounts.PAID} invoices</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${totalUnpaid.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{statusCounts.UNPAID} invoices</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalOverdue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{statusCounts.OVERDUE} invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Invoice History</CardTitle>
          <CardDescription>All your invoices with payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No invoices found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                    const isFullyPaid = totalPaid >= inv.amount;
                    const isOverdue = new Date(inv.dueDate) < new Date() && inv.status !== "PAID";
                    const displayStatus = isOverdue ? "OVERDUE" : inv.status;
                    const statusColors: Record<string, string> = {
                      PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                      UNPAID: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                      OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                      PARTIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                      WAIVED: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
                    };
                    const statusIcons: Record<string, React.ReactNode> = {
                      PAID: <CheckCircle className="h-4 w-4" />,
                      UNPAID: <Clock className="h-4 w-4" />,
                      OVERDUE: <XCircle className="h-4 w-4" />,
                      PARTIAL: <Clock className="h-4 w-4" />,
                      WAIVED: <CheckCircle className="h-4 w-4" />,
                    };
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.feeStructure?.name || "N/A"}</TableCell>
                        <TableCell>${inv.amount.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(inv.dueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", statusColors[displayStatus] || statusColors.UNPAID)}>
                            {statusIcons[displayStatus]}
                            {displayStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {totalPaid > 0 ? `$${totalPaid.toFixed(2)} paid` : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/student">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}