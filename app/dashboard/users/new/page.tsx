// app/dashboard/users/new/page.tsx
import UserForm from "./UserForm";

export default async function NewUserPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <UserForm />
    </div>
  );
}