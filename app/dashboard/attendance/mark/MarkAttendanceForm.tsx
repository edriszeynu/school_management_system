// @ts-nocheck
// app/(dashboard)/attendance/mark/MarkAttendanceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

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

interface MarkAttendanceFormProps {
  classOptions: ClassOption[];
  selectedClassId?: string;
  selectedDate: Date;
}

// Form validation schema (for the main form)
const formSchema = z.object({
  classId: z.string().min(1, "Please select a class"),
  date: z.date({ required_error: "Please select a date" }),
});

export default function MarkAttendanceForm({
  classOptions,
  selectedClassId,
  selectedDate,
}: MarkAttendanceFormProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: selectedClassId || "",
      date: selectedDate,
    },
  });

  const watchClassId = form.watch("classId");
  const watchDate = form.watch("date");

  // Fetch students when class or date changes
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
        setError(null);
      } catch (err) {
        setError("Failed to load students. Please try again.");
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    }

    fetchStudents();
  }, [watchClassId, watchDate]);

  // Update student status locally
  const updateStudentStatus = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  // Submit attendance
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Build records from current student state
      const records = students.map((s) => ({
        studentId: s.id,
        status: s.status || "ABSENT", // Default to ABSENT if not selected
        attendanceId: s.attendanceId,
      }));

      await saveAttendance({
        classId: data.classId,
        date: data.date,
        records,
      });
      // Redirect happens in server action
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Mark Attendance</CardTitle>
        <CardDescription>
          Select a class and date, then mark attendance for each student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classOptions.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.label}
                          </SelectItem>
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
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
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

            {/* Student Table */}
            {isLoadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead className="w-48">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>
                          <Select
                            value={student.status || "ABSENT"}
                            onValueChange={(value: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") =>
                              updateStudentStatus(student.id, value)
                            }
                          >
                            <SelectTrigger className="w-36">
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {watchClassId ? "No students found in this class." : "Select a class to load students."}
              </div>
            )}

            {/* Quick Actions */}
            {students.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    students.forEach((s) => updateStudentStatus(s.id, "PRESENT"));
                  }}
                >
                  Mark All Present
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    students.forEach((s) => updateStudentStatus(s.id, "ABSENT"));
                  }}
                >
                  Mark All Absent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    students.forEach((s) => updateStudentStatus(s.id, "LATE"));
                  }}
                >
                  Mark All Late
                </Button>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/attendance")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isLoadingStudents || students.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Attendance"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}