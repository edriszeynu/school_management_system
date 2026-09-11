// app/dashboard/exams/[id]/questions/QuestionBuilder.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Plus, CheckCircle2, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { createQuestion, deleteQuestion, publishExam } from "@/app/actions/question";

const formSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]),
  questionText: z.string().min(1, "Required"),
  points: z.coerce.number().positive(),
  correctAnswer: z.string().optional(),
  options: z.array(z.object({
    text: z.string(),
    isCorrect: z.boolean(),
  })).optional(),
});

interface Question {
  id: string;
  type: string;
  questionText: string;
  points: number;
  orderIndex: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface Props {
  examId: string;
  existingQuestions: Question[];
  status: string;
}

export default function QuestionBuilder({ examId, existingQuestions, status }: Props) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: "MULTIPLE_CHOICE", questionText: "", points: 1 },
  });

  const watchType = form.watch("type");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createQuestion({
        examId,
        type: data.type,
        questionText: data.questionText,
        points: data.points,
        correctAnswer: data.correctAnswer,
        options: data.type === "MULTIPLE_CHOICE" ? options.filter((o) => o.text.trim()) : undefined,
      });
      toast.success("Question added!");
      form.reset();
      setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to add question");
    }
  };

  const handlePublish = async (newStatus: "PUBLISHED" | "ACTIVE" | "CLOSED" | "DRAFT") => {
    setIsPublishing(true);
    try {
      await publishExam(examId, newStatus);
      toast.success(`Exam ${newStatus.toLowerCase()}!`);
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to update status");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id, examId);
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Add Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              <FormField control={form.control} name="questionText" render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your question..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="points" render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* MCQ Options */}
              {watchType === "MULTIPLE_CHOICE" && (
                <div className="space-y-2">
                  <FormLabel>Options</FormLabel>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox
                        checked={opt.isCorrect}
                        onCheckedChange={(checked) => {
                          const newOpts = options.map((o, i) => ({
                            ...o,
                            isCorrect: i === idx ? !!checked : false,
                          }));
                          setOptions(newOpts);
                        }}
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx].text = e.target.value;
                          setOptions(newOpts);
                        }}
                        placeholder={`Option ${idx + 1}`}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions([...options, { text: "", isCorrect: false }])}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              )}

              {/* True/False Correct Answer */}
              {watchType === "TRUE_FALSE" && (
                <FormField control={form.control} name="correctAnswer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              )}

              {/* Short Answer Correct */}
              {watchType === "SHORT_ANSWER" && (
                <FormField control={form.control} name="correctAnswer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer (text match)</FormLabel>
                    <FormControl><Input placeholder="Exact answer" {...field} /></FormControl>
                  </FormItem>
                )} />
              )}

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
          </Form>
        </CardContent>
      </Card>

      {/* Right: Existing Questions */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Exam Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {status === "DRAFT" && (
              <Button onClick={() => handlePublish("PUBLISHED")} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Publish Exam
              </Button>
            )}
            {status === "PUBLISHED" && (
              <Button onClick={() => handlePublish("ACTIVE")} disabled={isPublishing}>
                Open for Students
              </Button>
            )}
            {status === "ACTIVE" && (
              <Button variant="destructive" onClick={() => handlePublish("CLOSED")} disabled={isPublishing}>
                Close Exam
              </Button>
            )}
            {status === "CLOSED" && (
              <Button variant="outline" onClick={() => handlePublish("PUBLISHED")} disabled={isPublishing}>
                Reopen
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions ({existingQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingQuestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No questions yet</p>
            ) : (
              existingQuestions.map((q, idx) => (
                <div key={q.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Q{idx + 1}</Badge>
                        <Badge variant="secondary">{q.type.replace("_", " ")}</Badge>
                        <span className="text-xs text-muted-foreground">{q.points} pts</span>
                      </div>
                      <p className="text-sm font-medium">{q.questionText}</p>
                      {q.options.length > 0 && (
                        <ul className="mt-2 text-xs space-y-1">
                          {q.options.map((o) => (
                            <li key={o.id} className={o.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {o.isCorrect && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                              {o.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}