// app/dashboard/student/exams/[id]/TakeExamForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2, CircleDot, FileText, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { submitExam } from "@/app/actions/exam-submission";

interface Question {
  id: string;
  type: string;
  questionText: string;
  points: number;
  options: { id: string; text: string }[];
}

interface Props {
  exam: {
    id: string;
    title: string;
    instructions: string | null;
    questions: Question[];
  };
  submissionId: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  MULTIPLE_CHOICE: { label: "Multiple Choice", icon: CircleDot,    color: "text-blue-500",   bg: "bg-blue-500/10"   },
  TRUE_FALSE:      { label: "True / False",    icon: CheckCircle2, color: "text-green-500",  bg: "bg-green-500/10"  },
  SHORT_ANSWER:    { label: "Short Answer",    icon: FileText,     color: "text-purple-500", bg: "bg-purple-500/10" },
  ESSAY:           { label: "Essay",           icon: AlignLeft,    color: "text-orange-500", bg: "bg-orange-500/10" },
};

export default function TakeExamForm({ exam, submissionId }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, { text: string | null; optionId: string | null }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAnswer = (questionId: string, value: { text?: string | null; optionId?: string | null }) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        text: value.text !== undefined ? value.text : prev[questionId]?.text ?? null,
        optionId: value.optionId !== undefined ? value.optionId : prev[questionId]?.optionId ?? null,
      },
    }));
  };

  const handleSubmit = async () => {
    const unanswered = exam.questions.filter((q) => {
      const a = answers[q.id];
      if (q.type === "MULTIPLE_CHOICE") return !a?.optionId;
      return !a?.text;
    });
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) return;
    }
    setIsSubmitting(true);
    try {
      await submitExam({
        submissionId,
        answers: exam.questions.map((q) => ({
          questionId: q.id,
          answerText: answers[q.id]?.text || null,
          selectedOptionId: answers[q.id]?.optionId || null,
        })),
      });
      toast.success("Exam submitted successfully!");
      router.push("/dashboard/student/exams");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
      setIsSubmitting(false);
    }
  };

  const totalPoints = exam.questions.reduce((s, q) => s + q.points, 0);
  const answeredCount = exam.questions.filter((q) => {
    const a = answers[q.id];
    return q.type === "MULTIPLE_CHOICE" ? !!a?.optionId : !!a?.text;
  }).length;

  return (
    <div className="space-y-6 pb-10">

      {/* Exam Header Card */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">
              {exam.questions.length} questions
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-sm text-muted-foreground">
              {totalPoints} total points
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-sm font-medium text-primary">
              {answeredCount}/{exam.questions.length} answered
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${exam.questions.length > 0 ? (answeredCount / exam.questions.length) * 100 : 0}%` }}
            />
          </div>

          {exam.instructions && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
              <span className="font-semibold">Instructions: </span>
              {exam.instructions}
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      {exam.questions.map((q, idx) => {
        const config = typeConfig[q.type] || typeConfig.SHORT_ANSWER;
        const Icon = config.icon;
        const isAnswered = q.type === "MULTIPLE_CHOICE"
          ? !!answers[q.id]?.optionId
          : !!answers[q.id]?.text;

        return (
          <div
            key={q.id}
            className={cn(
              "rounded-2xl border bg-card shadow-sm overflow-hidden transition-all",
              isAnswered && "border-primary/30"
            )}
          >
            {/* Question header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {idx + 1}
                </div>
                <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.bg)}>
                  <Icon className={cn("h-3 w-3", config.color)} />
                  <span className={config.color}>{config.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAnswered && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <span className="text-xs font-semibold text-muted-foreground">
                  {q.points} pts
                </span>
              </div>
            </div>

            {/* Question body */}
            <div className="p-5 space-y-4">
              <p className="text-sm font-medium leading-relaxed">{q.questionText}</p>

              {q.type === "MULTIPLE_CHOICE" && (
                <RadioGroup
                  value={answers[q.id]?.optionId || ""}
                  onValueChange={(val) => setAnswer(q.id, { optionId: val })}
                  className="space-y-2"
                >
                  {q.options.map((opt) => {
                    const selected = answers[q.id]?.optionId === opt.id;
                    return (
                      <label
                        key={opt.id}
                        htmlFor={opt.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all hover:bg-muted/40",
                          selected && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value={opt.id} id={opt.id} />
                        <span className="text-sm flex-1">{opt.text}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}

              {q.type === "TRUE_FALSE" && (
                <RadioGroup
                  value={answers[q.id]?.text || ""}
                  onValueChange={(val) => setAnswer(q.id, { text: val })}
                  className="flex gap-3"
                >
                  {["true", "false"].map((val) => {
                    const selected = answers[q.id]?.text === val;
                    return (
                      <label
                        key={val}
                        htmlFor={`${q.id}-${val}`}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 cursor-pointer transition-all hover:bg-muted/40",
                          selected && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value={val} id={`${q.id}-${val}`} />
                        <span className="text-sm font-medium capitalize">{val}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}

              {q.type === "SHORT_ANSWER" && (
                <Textarea
                  value={answers[q.id]?.text || ""}
                  onChange={(e) => setAnswer(q.id, { text: e.target.value })}
                  placeholder="Type your answer..."
                  rows={2}
                  className="resize-none text-sm"
                />
              )}

              {q.type === "ESSAY" && (
                <Textarea
                  value={answers[q.id]?.text || ""}
                  onChange={(e) => setAnswer(q.id, { text: e.target.value })}
                  placeholder="Write your answer..."
                  rows={6}
                  className="resize-none text-sm"
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <Button variant="ghost" onClick={() => router.push("/dashboard/student/exams")} className="text-muted-foreground">
          ← Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="min-w-36">
          {isSubmitting
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            : <><Send className="mr-2 h-4 w-4" />Submit Exam</>
          }
        </Button>
      </div>
    </div>
  );
}
