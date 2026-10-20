"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2 } from "lucide-react";
import { updateExamStatus } from "@/app/actions/exam";

type Status = "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED";

const statusColors: Record<Status, string> = {
  DRAFT:     "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300",
  PUBLISHED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  ACTIVE:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CLOSED:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const nextStatus: Record<Status, Status | null> = {
  DRAFT:     "PUBLISHED",
  PUBLISHED: "ACTIVE",
  ACTIVE:    "CLOSED",
  CLOSED:    null,
};

const allStatuses: Status[] = ["DRAFT", "PUBLISHED", "ACTIVE", "CLOSED"];

export function ExamStatusButton({ examId, currentStatus }: { examId: string; currentStatus: Status }) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: Status) => {
    if (newStatus === status) return;
    setLoading(true);
    try {
      await updateExamStatus(examId, newStatus);
      setStatus(newStatus);
      toast.success(`Exam status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Badge className={`text-[10px] ${statusColors[status]}`}>{status}</Badge>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {allStatuses.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleChange(s)}
            className={s === status ? "font-semibold" : ""}
          >
            <Badge className={`mr-2 text-[10px] ${statusColors[s]}`}>{s}</Badge>
            {s === status && "✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
