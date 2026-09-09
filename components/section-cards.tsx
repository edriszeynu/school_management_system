"use client";

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, Users, UserCheck, BookOpen, DollarSign } from "lucide-react";

// This is now a client component that receives stats as props
interface SectionCardsProps {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingInvoices: number;
}

export function SectionCards({ totalStudents, totalTeachers, totalClasses, pendingInvoices }: SectionCardsProps) {
  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: <Users className="size-4" />,
      trend: "+12.5%",
      trendUp: true,
      description: "Enrolled this semester",
    },
    {
      title: "Total Teachers",
      value: totalTeachers,
      icon: <UserCheck className="size-4" />,
      trend: "+5.2%",
      trendUp: true,
      description: "Active staff members",
    },
    {
      title: "Total Classes",
      value: totalClasses,
      icon: <BookOpen className="size-4" />,
      trend: "+2",
      trendUp: true,
      description: "This academic year",
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices,
      icon: <DollarSign className="size-4" />,
      trend: "-8.3%",
      trendUp: false,
      description: "Unpaid fees",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat) => (
        <Card key={stat.title} className="@container/card">
          <CardHeader>
            <CardDescription>{stat.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {stat.trendUp ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingUpIcon className="size-3 rotate-180" />
                )}
                {stat.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {stat.icon}
              {stat.description}
            </div>
            <div className="text-muted-foreground">Updated in real-time</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}