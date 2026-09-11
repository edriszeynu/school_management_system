// @ts-nocheck
// app/(dashboard)/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  updateProfile,
  changePassword,
  createAcademicYear,
  setCurrentAcademicYear,
  deleteAcademicYear,
} from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Types
type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

type AcademicYear = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

interface SettingsClientProps {
  user: User | null;
  academicYears: AcademicYear[];
}

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Academic year form schema
const yearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
});

export default function SettingsClient({ user, academicYears }: SettingsClientProps) {
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [yearSuccess, setYearSuccess] = useState(false);
  const [years, setYears] = useState(academicYears);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Academic year form
  const yearForm = useForm<z.infer<typeof yearSchema>>({
    resolver: zodResolver(yearSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });

  // Submit profile
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await updateProfile(data);
      setProfileSuccess(true);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Submit password
  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess(true);
      passwordForm.reset();
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Submit academic year
  const onYearSubmit = async (data: z.infer<typeof yearSchema>) => {
    setIsYearLoading(true);
    setYearError(null);
    setYearSuccess(false);
    try {
      await createAcademicYear({
        name: data.name,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      });
      setYearSuccess(true);
      yearForm.reset({
        name: "",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      });
      // Refresh years list (re-fetch from server) - we'll just reload the page
      window.location.reload();
    } catch (err: any) {
      setYearError(err.message || "Failed to create academic year");
    } finally {
      setIsYearLoading(false);
    }
  };

  const handleSetCurrent = async (id: string) => {
    try {
      await setCurrentAcademicYear(id);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteYear = async (id: string) => {
    try {
      await deleteAcademicYear(id);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, academic years, and system preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form form={profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email (read-only)</Label>
                      <Input value={user?.email || ""} disabled className="bg-muted" />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {profileError && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                      Profile updated successfully!
                    </div>
                  )}
                  <Button type="submit" disabled={isProfileLoading}>
                    {isProfileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password. You'll need your current password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form form={passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {passwordError && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                      Password changed successfully!
                    </div>
                  )}
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Years Tab */}
        <TabsContent value="academic-years" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Years</CardTitle>
              <CardDescription>
                Manage academic years. Only one year can be current.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* List existing years */}
              <div className="space-y-2">
                {years.length === 0 ? (
                  <p className="text-muted-foreground">No academic years found.</p>
                ) : (
                  years.map((year) => (
                    <div
                      key={year.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{year.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(year.startDate), "PPP")} - {format(new Date(year.endDate), "PPP")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {year.isCurrent && (
                          <Badge variant="default" className="bg-green-500">
                            Current
                          </Badge>
                        )}
                        {!year.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetCurrent(year.id)}
                          >
                            Set Current
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                the academic year "{year.name}". This will also delete
                                all associated classes, exams, and fee structures.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteYear(year.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Add New Academic Year</h3>
                <Form form={yearForm}>
                  <form onSubmit={yearForm.handleSubmit(onYearSubmit)} className="space-y-4">
                    <FormField
                      control={yearForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2026-2027" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={yearForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
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
                      <FormField
                        control={yearForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
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
                    {yearError && (
                      <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {yearError}
                      </div>
                    )}
                    {yearSuccess && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                        Academic year created successfully!
                      </div>
                    )}
                    <Button type="submit" disabled={isYearLoading}>
                      {isYearLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Add Academic Year"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                General system settings and information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">App Version</span>
                  <div className="font-medium">v1.0.0</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">Environment</span>
                  <div className="font-medium">
                    {process.env.NODE_ENV === "production" ? "Production" : "Development"}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">User Role</span>
                  <div className="font-medium">{user?.role}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <div className="font-medium">PostgreSQL (Supabase)</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground pt-2">
                <p>Theme preference can be changed using the toggle in the header.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}