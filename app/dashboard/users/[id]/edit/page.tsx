import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserForm from "../../new/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      gender: true,
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <UserForm user={user} />
    </div>
  );
}
