// app/(dashboard)/students/new/page.tsx
import { prisma } from "@/lib/prisma";
import NewStudentForm from "./NewStudentForm";

export default async function NewStudentPage() {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      section: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <NewStudentForm classes={classes} />
    </div>
  );
}