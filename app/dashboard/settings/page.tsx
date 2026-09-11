// app/(dashboard)/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  // Fetch academic years
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { name: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <SettingsClient
        user={user}
        academicYears={academicYears}
      />
    </div>
  );
}