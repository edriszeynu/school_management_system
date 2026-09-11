// @ts-nocheck
// app/dashboard/teacher/attendance/AttendanceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStudentsForAttendance, saveAttendance } from "@/app/actions/attendance";

type StudentRecord = {
  id: string;
  name: string;
  rollNumber: string;
  attendanceId: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | null;
};

type ClassOption = {
  id: string;
  label: string;
};

interface AttendanceFormProps {
  classOptions: ClassOption[];
}

const formSchema = z.object({
  classId: z.string().min(1, "Please select a class"),
  date: z.date({ required_error: "Please select a date" }),
});

const statusStyles: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ABSENT:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LATE:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  EXCUSED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function AttendanceForm({ classOptions }: AttendanceFormProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: "",
      date: new Date(),
    },
  });

  const watchClassId = form.watch("classId");
  const watchDate = form.watch("date");

  useEffect(() => {
    async function fetchStudents() {
      if (!watchClassId || !watchDate) {
        setStudents([]);
        return;
      }
      setIsLoadingStudents(true);
      try {
        const data = await getStudentsForAttendance(watchClassId, watchDate);
        setStudents(data);
      } catch (err) {
        toast.error("Failed to load students. Please try again.");
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    }
    fetchStudents();
  }, [watchClassId, watchDate]);

  const updateStudentStatus = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: s.status || "ABSENT",
        attendanceId: s.attendanceId,
      }));
      await saveAttendance({ classId: data.classId, date: data.date, records });
      toast.success("Attendance saved successfully!");
      router.push("/dashboard/teacher/attendance");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const markAll = (status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold">Mark Attendance</CardTitle>
        <CardDescription>
          Select a class and date, then mark each student's status.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form
          form={form}
          onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit)(e); }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Class *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classOptions.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Date *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        />
                      }
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isLoadingStudents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-12 text-xs font-semibold uppercase">#</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Student Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Roll No.</TableHead>
                      <TableHead className="w-48 text-xs font-semibold uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="text-muted-foreground text-sm font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={student.status || "ABSENT"}
                            onValueChange={(value: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") =>
                              updateStudentStatus(student.id, value)
                            }
                          >
                            <SelectTrigger className={cn("w-36 h-8 text-xs font-medium border", student.status ? statusStyles[student.status] : statusStyles["ABSENT"])}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PRESENT">Present</SelectItem>
                              <SelectItem value="ABSENT">Absent</SelectItem>
                              <SelectItem value="LATE">Late</SelectItem>
                              <SelectItem value="EXCUSED">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => markAll(s)}
                    className="text-xs"
                  >
                    Mark All {s.charAt(0) + s.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-lg border border-dashed text-muted-foreground">
              <p className="text-sm">
                {watchClassId
                  ? "No students found in this class."
                  : "Select a class to load students."}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/teacher")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isLoadingStudents || students.length === 0}
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                "Save Attendance"
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
