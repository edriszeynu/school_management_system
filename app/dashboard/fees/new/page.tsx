// app/(dashboard)/fees/new/page.tsx
import { prisma } from "@/lib/prisma";
import NewInvoiceForm from "./NewInvoiceForm";

export default async function NewInvoicePage() {
  // Fetch students (with name) and fee structures
  const [students, feeStructures] = await Promise.all([
    prisma.studentProfile.findMany({
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.feeStructure.findMany({
      include: {
        class: { select: { name: true } },
        academicYear: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Format options
  const studentOptions = students.map((s) => ({
    id: s.id,
    label: `${s.user.name} (${s.class?.name || "N/A"})`,
  }));

  const feeOptions = feeStructures.map((f) => ({
    id: f.id,
    label: `${f.name} - ${f.class?.name || "N/A"} (${f.academicYear?.name || "N/A"})`,
    amount: f.amount,
  }));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <NewInvoiceForm
        studentOptions={studentOptions}
        feeOptions={feeOptions}
      />
    </div>
  );
}