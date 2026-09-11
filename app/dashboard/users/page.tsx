import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      studentProfile: { select: { id: true } },
      teacherProfile: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tableData = users.map((u: typeof users[number]) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.isActive ? "Active" : "Inactive",
    createdAt: u.createdAt.toISOString(),
    hasProfile: !!(u.studentProfile || u.teacherProfile),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all system users</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}