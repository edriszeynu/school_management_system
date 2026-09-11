// app/dashboard/exams/[id]/questions/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuestionBuilder from "./QuestionBuilder";

export default async function ExamQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
      _count: { select: { questions: true } },
    },
  });

  if (!exam) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/exams"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground">
            {exam.class ? `${exam.class.name} - ${exam.class.section}` : "School-wide"} • Max Score: {exam.maxScore}
          </p>
        </div>
        <Badge>{exam.status}</Badge>
      </div>

      <QuestionBuilder
        examId={exam.id}
        existingQuestions={exam.questions.map((q) => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          points: q.points,
          orderIndex: q.orderIndex,
          options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
        }))}
        status={exam.status}
      />
    </div>
  );
}