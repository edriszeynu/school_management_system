"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartProps = {
  paymentData: { date: string; amount: number }[];
  attendanceChartData: { name: string; value: number; color: string }[];
  enrollmentData: { name: string; students: number }[];
};

export default function ReportsCharts({
  paymentData,
  attendanceChartData,
  enrollmentData,
}: ChartProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Status (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={attendanceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip />
              <Bar dataKey="students" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
