// app/(dashboard)/search/page.tsx
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <SearchClient />
    </div>
  );
}