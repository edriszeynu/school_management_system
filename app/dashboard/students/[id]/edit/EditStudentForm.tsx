"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateStudent } from "@/app/actions/student";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianContact: z.string().min(1, "Guardian contact is required"),
  guardianEmail: z.string().email("Invalid guardian email").optional().or(z.literal("")),
  address: z.string().optional(),
  medicalInfo: z.string().optional(),
  classId: z.string().min(1, "Please select a class"),
  rollNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  student: {
    id: string;
    rollNumber: string | null;
    guardianName: string;
    guardianContact: string;
    guardianEmail: string | null;
    address: string | null;
    medicalInfo: string | null;
    classId: string | null;
    user: { name: string; email: string };
  };
  classes: { id: string; name: string; section: string }[];
}

export default function EditStudentForm({ student, classes }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student.user.name,
      email: student.user.email,
      guardianName: student.guardianName,
      guardianContact: student.guardianContact,
      guardianEmail: student.guardianEmail || "",
      address: student.address || "",
      medicalInfo: student.medicalInfo || "",
      classId: student.classId || "",
      rollNumber: student.rollNumber || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateStudent(student.id, data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold">Edit Student</CardTitle>
        <CardDescription>Update the student's information below.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form form={form} onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit)(e); }} className="space-y-6">

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="student@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="guardianName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian Name *</FormLabel>
                  <FormControl><Input placeholder="Guardian's full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="guardianContact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian Contact *</FormLabel>
                  <FormControl><Input placeholder="Phone number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="guardianEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Email</FormLabel>
                <FormControl><Input type="email" placeholder="guardian@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Academic */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Academic & Additional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="classId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name} - {cls.section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="rollNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl><Input placeholder="e.g., 01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Input placeholder="Student's address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="medicalInfo" render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Information</FormLabel>
                <FormControl><Input placeholder="Allergies, conditions, etc." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/students/${student.id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
