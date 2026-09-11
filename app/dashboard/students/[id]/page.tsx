// @ts-nocheck
// app/dashboard/students/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Helper functions
function getGradeColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 75) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getGradeLetter(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const { tab } = await searchParams;

  // Fetch student with all relations
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: true,
      class: {
        include: {
          academicYear: true,
        },
      },
      attendances: {
        orderBy: { date: "desc" },
        take: 30,
      },
      grades: {
        include: {
          exam: true,
          classSubject: {
            include: {
              subject: true,
              class: true,
            },
          },
        },
        orderBy: { exam: { startDate: "desc" } },
      },
      invoices: {
        include: {
          feeStructure: true,
          payments: true,
        },
        orderBy: { dueDate: "desc" },
      },
    },
  });

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Student not found</h2>
        <p className="text-muted-foreground">
          The student profile you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  // Attendance stats
  const totalDays = student.attendances.length;
  const presentDays = student.attendances.filter((a) => a.status === "PRESENT").length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Fee stats
  const unpaidInvoices = student.invoices.filter(
    (inv) => inv.status === "UNPAID" || inv.status === "OVERDUE"
  );
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Grade stats
  const gradeCount = student.grades.length;
  const averageGrade = gradeCount > 0
    ? Math.round(student.grades.reduce((sum, g) => sum + g.score, 0) / gradeCount * 10) / 10
    : null;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.user.name}</h1>
          <p className="text-muted-foreground">
            Student Profile • {student.class?.name} - {student.class?.section}
          </p>
        </div>
        <Badge className="ml-auto" variant={student.user.isActive ? "default" : "secondary"}>
          {student.user.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Roll Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.rollNumber || "N/A"}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.class?.name || "N/A"}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {presentDays}/{totalDays} present
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade !== null ? `${averageGrade}%` : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {gradeCount} exam{gradeCount > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue={tab || "personal"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Full Name:</span>
                  <span>{student.user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{student.user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{student.user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date of Birth:</span>
                  <span>{format(new Date(student.dateOfBirth), "PPP")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Enrolled:</span>
                  <span>{format(new Date(student.enrollmentDate), "PPP")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Academic Year:</span>
                  <span>{student.class?.academicYear?.name || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{student.guardianName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Contact:</span>
                  <span>{student.guardianContact}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{student.guardianEmail || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span>{student.address || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Medical Info:</span>
                  <span>{student.medicalInfo || "None"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">All Grades</CardTitle>
              <CardDescription>
                {student.grades.length} exam{student.grades.length > 1 ? "s" : ""} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.grades.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No grades available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">
                          {grade.classSubject.subject.name}
                        </TableCell>
                        <TableCell>{grade.exam.title}</TableCell>
                        <TableCell>{format(new Date(grade.exam.startDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right font-medium">
                          {grade.score}%
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn("font-semibold", getGradeColor(grade.score))}>
                            {getGradeLetter(grade.score)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {grade.remarks || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Attendance History (Last 30 Days)</CardTitle>
              <CardDescription>
                {presentDays} present out of {totalDays} days ({attendancePercentage}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.attendances.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No attendance records.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.attendances.slice(0, 30).map((record) => {
                    const statusColors = {
                      PRESENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                      ABSENT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                      LATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                      EXCUSED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                      HOLIDAY: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
                    };
                    return (
                      <Badge
                        key={record.id}
                        className={cn(
                          "px-3 py-1 text-xs font-medium",
                          statusColors[record.status] || "bg-gray-100"
                        )}
                      >
                        {format(new Date(record.date), "MMM d")} • {record.status}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Fee Invoices</CardTitle>
              <CardDescription>
                {student.invoices.length} invoice{student.invoices.length > 1 ? "s" : ""} • Total Due: ${totalUnpaid.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No invoices found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.feeStructure?.name || "N/A"}</TableCell>
                        <TableCell>${inv.amount.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(inv.dueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              inv.status === "PAID"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : inv.status === "OVERDUE"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Back to List */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/students">Back to Students</Link>
        </Button>
      </div>
    </div>
  );
}
