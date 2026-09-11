"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap, Users, CalendarCheck, BookOpen,
  CreditCard, BarChart3, ChevronRight, CheckCircle2, Moon, Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-context";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Users,        title: "Student Management", desc: "Enroll, track, and manage students with detailed profiles, class assignments, and roll numbers.", color: "text-blue-500",   bg: "bg-blue-500/10"   },
  { icon: CalendarCheck,title: "Attendance Tracking", desc: "Mark daily attendance per class. Teachers can record Present, Absent, Late, or Excused status.",  color: "text-green-500",  bg: "bg-green-500/10"  },
  { icon: BookOpen,     title: "Grades & Exams",      desc: "Create exams, enter grades per subject, and track student performance with detailed analytics.",   color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: CreditCard,   title: "Fee Management",      desc: "Generate invoices, track payments, and manage fee structures with overdue alerts.",                color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: BarChart3,    title: "Reports & Analytics", desc: "Visual charts for fee collections, attendance trends, and academic performance.",                  color: "text-pink-500",   bg: "bg-pink-500/10"   },
  { icon: GraduationCap,title: "Role-Based Access",   desc: "Separate dashboards for Admins, Teachers, Students, and Parents — each with tailored views.",      color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

const roles = [
  { role: "Admin",   desc: "Full control over school operations, users, fees, and reports.",         color: "border-indigo-500/40 bg-indigo-500/5"  },
  { role: "Teacher", desc: "Mark attendance, enter grades, view your classes and timetable.",         color: "border-green-500/40 bg-green-500/5"    },
  { role: "Student", desc: "View grades, timetable, attendance history, and fee invoices.",           color: "border-purple-500/40 bg-purple-500/5"  },
  { role: "Parent",  desc: "Monitor your children's academic progress, fees, and attendance.",        color: "border-orange-500/40 bg-orange-500/5"  },
];

const stats = [
  { value: "4",         label: "Role Types"  },
  { value: "10+",       label: "Features"    },
  { value: "Real-time", label: "Updates"     },
  { value: "100%",      label: "Responsive"  },
];

const checkItems = [
  "Real-time attendance and grade tracking",
  "Separate dashboards per role",
  "Fee invoice generation and payment tracking",
  "Timetable management for students and teachers",
  "Parent portal to monitor children's progress",
  "Dark and light mode support",
  "Fully responsive on all devices",
  "Secure role-based access control",
];

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Navbar — slides down */}
      <motion.header
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md"
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <div className="rounded-lg bg-primary/10 p-1.5">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold">SchoolPro</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease }}
          >
            <button onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild variant="ghost" size="sm"><Link href="/login">Sign In</Link></Button>
            <Button asChild size="sm"><Link href="/login">Get Started <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated background orbs */}
        <motion.div
          className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-200 h-96 rounded-full bg-primary/15 blur-3xl -z-10 pointer-events-none"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-blue-500/10 blur-3xl -z-10 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-[5%] w-48 h-48 rounded-full bg-purple-500/10 blur-3xl -z-10 pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <FadeUp delay={0}>
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium">
              🎓 Complete School Management System
            </Badge>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mt-4">
              Manage Your School<br />
              <motion.span
                className="text-primary inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease }}
              >
                Smarter & Faster
              </motion.span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.25}>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              SchoolPro brings together students, teachers, parents, and administrators
              in one powerful platform. Track attendance, grades, fees, and more — in real-time.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button asChild size="lg" className="text-base px-8">
                  <Link href="/login">Start for Free <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button asChild size="lg" variant="outline" className="text-base px-8">
                  <Link href="/login">View Demo</Link>
                </Button>
              </motion.div>
            </div>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.45}>
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="rounded-xl border bg-card p-4 cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-3">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">Everything you need</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Built for modern schools — from small institutions to large campuses.</p>
            </div>
          </FadeUp>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScaleIn key={f.title} delay={i * 0.07}>
                <motion.div
                  className="rounded-2xl border bg-card p-6 h-full cursor-default"
                  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", transition: { duration: 0.25 } }}
                >
                  <motion.div
                    className={`inline-flex rounded-xl p-2.5 mb-4 ${f.bg}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </motion.div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-24 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-3">Who it's for</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">Built for every role</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Each user type gets a tailored experience with the right tools and data.</p>
            </div>
          </FadeUp>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r, i) => (
              <FadeUp key={r.role} delay={i * 0.08}>
                <motion.div
                  className={`rounded-2xl border p-6 h-full cursor-default ${r.color}`}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <div className="text-lg font-bold mb-2">{r.role}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Why SchoolPro */}
      <section className="py-24 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3">Why SchoolPro</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">Designed for real schools</h2>
            </div>
          </FadeUp>
          <div className="grid gap-4 sm:grid-cols-2">
            {checkItems.map((item, i) => (
              <FadeUp key={item} delay={i * 0.05}>
                <motion.div
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="rounded-3xl border bg-card p-12 relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-primary/5 pointer-events-none" />
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                <GraduationCap className="h-12 w-12 text-primary mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Sign in with your credentials and start managing your school today.
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button asChild size="lg" className="text-base px-10">
                  <Link href="/login">Sign In to SchoolPro</Link>
                </Button>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">SchoolPro</span>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SchoolPro. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <button onClick={toggleTheme} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
