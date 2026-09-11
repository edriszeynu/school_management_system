// app/dashboard/teachers/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, User, Mail, Phone, BookOpen, Users, Calendar, Award } from "lucide-react";

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

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  // Fetch teacher with all relations
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: true,
      classSubjects: {
        include: {
          class: {
            include: {
              academicYear: true,
              _count: { select: { students: true } },
            },
          },
          subject: true,
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Teacher not found</h2>
        <p className="text-muted-foreground">
          The teacher profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/teachers">Back to Teachers</Link>
        </Button>
      </div>
    );
  }

  // Compute stats
  const totalClasses = new Set(teacher.classSubjects.map((cs) => cs.classId)).size;
  const totalSubjects = new Set(teacher.classSubjects.map((cs) => cs.subjectId)).size;
  const totalStudents = teacher.classSubjects.reduce(
    (sum, cs) => sum + (cs.class._count.students || 0),
    0
  );

  // Group classes by academic year
  const classGroups = new Map<string, typeof teacher.classSubjects>();
  teacher.classSubjects.forEach((cs) => {
    const yearName = cs.class.academicYear?.name || "Unknown";
    if (!classGroups.has(yearName)) {
      classGroups.set(yearName, []);
    }
    classGroups.get(yearName)!.push(cs);
  });

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{teacher.user.name}</h1>
          <p className="text-muted-foreground">
            Teacher Profile • {teacher.specialization || "General"}
          </p>
        </div>
        <Badge className="ml-auto" variant={teacher.user.isActive ? "default" : "secondary"}>
          {teacher.user.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Employee ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.employeeId || "N/A"}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
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
                  <span>{teacher.user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{teacher.user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{teacher.user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Hire Date:</span>
                  <span>{format(new Date(teacher.hireDate), "PPP")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Qualification:</span>
                  <span>{teacher.qualification || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Specialization:</span>
                  <span>{teacher.specialization || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Class Teacher:</span>
                  <span>{teacher.isClassTeacher ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Teaching Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Classes:</span>
                  <span>{totalClasses}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Subjects:</span>
                  <span>{totalSubjects}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Students:</span>
                  <span>{totalStudents}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classes & Subjects Tab */}
        <TabsContent value="classes" className="space-y-4">
          {Array.from(classGroups.entries()).map(([yearName, entries]) => (
            <Card key={yearName} className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{yearName}</CardTitle>
                <CardDescription>
                  {entries.length} class-subject assignment{entries.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((cs) => (
                      <TableRow key={cs.id}>
                        <TableCell className="font-medium">
                          {cs.class.name} - {cs.class.section}
                        </TableCell>
                        <TableCell>{cs.subject.name}</TableCell>
                        <TableCell>{cs.class._count.students}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/classes/${cs.classId}`}>
                              View Class
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          {teacher.classSubjects.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No class assignments found.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Back to List */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/teachers">Back to Teachers</Link>
        </Button>
      </div>
    </div>
  );
}