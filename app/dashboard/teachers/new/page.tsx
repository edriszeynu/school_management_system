// app/(dashboard)/teachers/new/page.tsx
import NewTeacherForm from "./NewTeacherForm";

export default async function NewTeacherPage() {
  // No data fetching needed for now – we can later add subjects/classes
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <NewTeacherForm />
    </div>
  );
}