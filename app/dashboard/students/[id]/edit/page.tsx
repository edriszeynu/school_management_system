// app/dashboard/students/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditStudentForm from "./EditStudentForm";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const [student, classes] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, section: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!student) redirect("/dashboard/students");

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <EditStudentForm student={student} classes={classes} />
    </div>
  );
}
