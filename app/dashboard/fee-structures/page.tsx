import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";

export default async function FeeStructuresPage() {
  const fees = await prisma.feeStructure.findMany({
    include: {
      academicYear: { select: { name: true } },
      class: { select: { name: true, section: true } },
    },
    orderBy: { name: "asc" },
  });

  const tableData = fees.map((fee) => ({
    id: fee.id,
    name: fee.name,
    class: `${fee.class.name} - ${fee.class.section}`,
    academicYear: fee.academicYear.name,
    amount: `$${fee.amount.toFixed(2)}`,
    frequency: fee.frequency,
    dueDay: fee.dueDay || "-",
    isMandatory: fee.isMandatory ? "Yes" : "No",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold">Fee Structures</h1>
          <p className="text-muted-foreground">Manage fee types per class</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/fee-structures/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Fee Structure
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}
