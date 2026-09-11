// @ts-nocheck
// app/dashboard/teacher/grades/GradeForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getExamsForClassSubject,
  getStudentsWithGrades,
  saveGrades,
  deleteGrade,
} from "@/app/actions/grade";
type StudentRecord = {
  id: string;
  name: string;
  rollNumber: string;
  gradeId: string | null;
  score: number | null;
  remarks: string;
};
type ClassSubjectOption = {
  id: string;
  label: string;
};
interface GradeFormProps {
  classSubjectOptions: ClassSubjectOption[];
}
const formSchema = z.object({
  classSubjectId: z.string().min(1, "Please select a class and subject"),
  examId: z.string().min(1, "Please select an exam"),
});
export default function GradeForm({ classSubjectOptions }: GradeFormProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [examOptions, setExamOptions] = useState<{ id: string; label: string }[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { classSubjectId: "", examId: "" },
  });
  const watchClassSubjectId = form.watch("classSubjectId");
  const watchExamId = form.watch("examId");
  useEffect(() => {
    async function fetchExams() {
      if (!watchClassSubjectId) { setExamOptions([]); form.setValue("examId", ""); return; }
      setIsLoadingExams(true);
      try {
        const exams = await getExamsForClassSubject(watchClassSubjectId);
        setExamOptions(exams.map((e) => ({ id: e.id, label: `${e.title} (Max: ${e.maxScore})` })));
        form.setValue("examId", "");
      } catch { toast.error("Failed to load exams."); }
      finally { setIsLoadingExams(false); }
    }
    fetchExams();
  }, [watchClassSubjectId, form]);
  useEffect(() => {
    async function fetchStudents() {
      if (!watchClassSubjectId || !watchExamId) { setStudents([]); return; }
      setIsLoadingStudents(true);
      try {
        const data = await getStudentsWithGrades(watchClassSubjectId, watchExamId);
        setStudents(data);
      } catch { toast.error("Failed to load students."); setStudents([]); }
      finally { setIsLoadingStudents(false); }
    }
    fetchStudents();
  }, [watchClassSubjectId, watchExamId]);
  const updateStudentScore = (studentId: string, score: string) => {
    setStudents((prev) =>
      prev.map((s) => s.id === studentId ? { ...s, score: score === "" ? null : parseFloat(score) } : s)
    );
  };
  const updateStudentRemarks = (studentId: string, remarks: string) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, remarks } : s)));
  };
  const handleDeleteGrade = async (studentId: string, gradeId: string) => {
    if (!gradeId) return;
    setIsDeleting(studentId);
    try {
      await deleteGrade(gradeId);
      setStudents((prev) =>
        prev.map((s) => s.id === studentId ? { ...s, gradeId: null, score: null, remarks: "" } : s)
      );
      toast.success("Grade deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete grade.");
    } finally { setIsDeleting(null); }
  };
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (students.length === 0) { toast.error("No students to grade."); return; }
    setIsSaving(true);
    try {
      await saveGrades({
        classSubjectId: data.classSubjectId,
        examId: data.examId,
        records: students.map((s) => ({ studentId: s.id, score: s.score, remarks: s.remarks, gradeId: s.gradeId })),
      });
      toast.success("Grades saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally { setIsSaving(false); }
  };
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold">Enter Grades</CardTitle>
        <CardDescription>
          Select a class, subject, and exam to enter or edit scores.
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
              name="classSubjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Class & Subject *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select class & subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classSubjectOptions.map((cs) => (
                        <SelectItem key={cs.id} value={cs.id}>{cs.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Exam *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchClassSubjectId || isLoadingExams}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={isLoadingExams ? "Loading..." : "Select an exam"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {examOptions.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-12 text-xs font-semibold uppercase">#</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Student Name</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Roll No.</TableHead>
                    <TableHead className="w-32 text-xs font-semibold uppercase">Score</TableHead>
                    <TableHead className="w-48 text-xs font-semibold uppercase">Remarks</TableHead>
                    <TableHead className="w-16 text-right text-xs font-semibold uppercase">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-muted/20 transition-colors group">
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
                        <Input
                          type="number"
                          step="0.01"
                          value={student.score ?? ""}
                          onChange={(e) => updateStudentScore(student.id, e.target.value)}
                          placeholder="Score"
                          className="w-24 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={student.remarks}
                          onChange={(e) => updateStudentRemarks(student.id, e.target.value)}
                          placeholder="Remarks (optional)"
                          className="w-40 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {student.gradeId ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {isDeleting === student.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Grade?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the grade for{" "}
                                  <strong>{student.name}</strong>. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteGrade(student.id, student.gradeId!)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-muted-foreground">No grade</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-lg border border-dashed text-muted-foreground">
              <p className="text-sm">
                {watchClassSubjectId && watchExamId
                  ? "No students found for this class and exam."
                  : "Select a class, subject, and exam to load students."}
              </p>
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/teacher">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isLoadingStudents || students.length === 0}
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                "Save Grades"
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
