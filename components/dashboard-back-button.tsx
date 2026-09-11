import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardBackButton() {
  return (
    <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard" title="Back to dashboard">
      <Link href="/dashboard">
        <ArrowLeft className="size-4" />
      </Link>
    </Button>
  );
}
