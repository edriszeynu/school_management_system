"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { getDashboardPath } from "@/lib/roles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setAuthError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }
      const session = await getSession();
      router.push(getDashboardPath(session?.user?.role));
      router.refresh();
    } catch {
      setAuthError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div id="sign-in" className="scroll-mt-24">
      <div className="mb-8">
        <p className="mb-3 text-xs font-bold uppercase text-primary">SchoolPro portal</p>
        <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-[34px]">Sign in to your account</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Access your classes, school records, and updates.</p>
      </div>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@school.edu" type="email" autoComplete="username" disabled={isLoading} className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isLoading}
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {authError}
            </motion.div>
          )}
          <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Signing in...</> : "Sign In"}
          </Button>
        </Form>
      <p className="mt-7 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
        Need access? Contact your school administrator.
      </p>
    </div>
  );
}