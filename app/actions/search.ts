// app/actions/search.ts
"use server";

import { prisma } from "@/lib/prisma";

export type SearchResult = {
  id: string;
  type: "student" | "teacher" | "class" | "user";
  name: string;
  email?: string;
  additionalInfo?: string;
  link: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const searchTerm = query.trim();

  // Search Students (by user name or roll number)
  const students = await prisma.studentProfile.findMany({
    where: {
      OR: [
        { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        { rollNumber: { contains: searchTerm, mode: "insensitive" } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
      ],
    },
    include: {
      user: { select: { name: true, email: true } },
      class: { select: { name: true } },
    },
    take: 10,
  });

  // Search Teachers (by user name or employeeId)
  const teachers = await prisma.teacherProfile.findMany({
    where: {
      OR: [
        { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        { employeeId: { contains: searchTerm, mode: "insensitive" } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
      ],
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    take: 10,
  });

  // Search Classes
  const classes = await prisma.class.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { section: { contains: searchTerm, mode: "insensitive" } },
        { roomNumber: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: {
      academicYear: { select: { name: true } },
    },
    take: 10,
  });

  // Search Users (for admins, parents, etc.)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
      role: { notIn: ["STUDENT", "TEACHER"] }, // students & teachers already covered
    },
    take: 5,
  });

  // Map results
  const results: SearchResult[] = [];

  students.forEach((s) => {
    results.push({
      id: s.id,
      type: "student",
      name: s.user.name,
      email: s.user.email || undefined,
      additionalInfo: `Roll: ${s.rollNumber || "N/A"} • Class: ${s.class?.name || "N/A"}`,
      link: `/dashboard/students/${s.id}`,
    });
  });

  teachers.forEach((t) => {
    results.push({
      id: t.id,
      type: "teacher",
      name: t.user.name,
      email: t.user.email || undefined,
      additionalInfo: `Employee ID: ${t.employeeId || "N/A"} • ${t.specialization || "General"}`,
      link: `/dashboard/teachers/${t.id}`,
    });
  });

  classes.forEach((c) => {
    results.push({
      id: c.id,
      type: "class",
      name: `${c.name} - ${c.section}`,
      email: undefined,
      additionalInfo: `Room: ${c.roomNumber || "N/A"} • Year: ${c.academicYear?.name || "N/A"}`,
      link: `/dashboard/classes/${c.id}`,
    });
  });

  users.forEach((u) => {
    results.push({
      id: u.id,
      type: "user",
      name: u.name,
      email: u.email || undefined,
      additionalInfo: `Role: ${u.role}`,
      link: `/dashboard/users/${u.id}`,
    });
  });

  // Sort by relevance (name match first, then email, etc.)
  // We'll just keep the order as returned.

  return results;
}