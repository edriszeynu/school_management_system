// app/(dashboard)/fees/new/NewInvoiceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createInvoice } from "@/app/actions/invoice";

// Validation schema
const formSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  feeStructureId: z.string().min(1, "Please select a fee structure"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.date({ required_error: "Due date is required" }),
  status: z.enum(["PAID", "PARTIAL", "UNPAID", "OVERDUE", "WAIVED"]),
  issueDate: z.date().optional(),
  lateFee: z.coerce.number().min(0, "Late fee cannot be negative").default(0),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Option = { id: string; label: string; amount?: number };

interface NewInvoiceFormProps {
  studentOptions: Option[];
  feeOptions: (Option & { amount: number })[];
}

export default function NewInvoiceForm({
  studentOptions,
  feeOptions,
}: NewInvoiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      feeStructureId: "",
      amount: 0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "UNPAID",
      issueDate: new Date(),
      lateFee: 0,
      description: "",
    },
  });

  // Auto-fill amount when fee structure changes
  const watchFeeStructureId = form.watch("feeStructureId");
  useEffect(() => {
    if (watchFeeStructureId) {
      const selected = feeOptions.find((f) => f.id === watchFeeStructureId);
      if (selected) {
        form.setValue("amount", selected.amount);
      }
    }
  }, [watchFeeStructureId, feeOptions, form]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await createInvoice(data);
      // Redirect happens in server action
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create Invoice</CardTitle>
        <CardDescription>
          Generate a new invoice for a student. The amount will auto‑fill from the fee structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studentOptions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
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
                name="feeStructureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Structure *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a fee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {feeOptions.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                        <SelectItem value="WAIVED">Waived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lateFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Fee ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/fees")}
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
                  "Create Invoice"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}