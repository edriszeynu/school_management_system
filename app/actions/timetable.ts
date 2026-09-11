// @ts-nocheck
// app/actions/timetable.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getTeacherTimetable(teacherProfileId: string) {
  // Fetch all timetable entries for this teacher
  const timetableEntries = await prisma.timetable.findMany({
    where: {
      classSubject: {
        teacherProfileId: teacherProfileId,
      },
    },
    include: {
      classSubject: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              section: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { period: "asc" },
    ],
  });

  // Group by day of week
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const periods = Array.from(
    new Set(timetableEntries.map((t) => t.period))
  ).sort((a: number, b: number) => a - b);

  // Create a map: day -> period -> entry
  const timetableMap: Record<string, Record<number, typeof timetableEntries[0] | null>> = {};

  days.forEach((day) => {
    timetableMap[day] = {};
    periods.forEach((period) => {
      timetableMap[day][period] = null;
    });
  });

  timetableEntries.forEach((entry) => {
    const day = entry.dayOfWeek;
    const period = entry.period;
    if (timetableMap[day] && timetableMap[day][period] !== undefined) {
      timetableMap[day][period] = entry;
    }
  });

  return {
    days,
    periods,
    timetableMap,
    entries: timetableEntries,
  };
}