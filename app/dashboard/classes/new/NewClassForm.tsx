// app/(dashboard)/classes/new/NewClassForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClass } from "@/app/actions/class";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().int().positive("Capacity must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

type AcademicYear = {
  id: string;
  name: string;
};

interface NewClassFormProps {
  academicYears: AcademicYear[];
}

export default function NewClassForm({ academicYears }: NewClassFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      section: "",
      academicYearId: "",
      roomNumber: "",
      capacity: 30,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await createClass(data);
      // Redirect happens in server action
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Add New Class</CardTitle>
        <CardDescription>
          Fill in the class details below. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grade 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 201" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/classes")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}