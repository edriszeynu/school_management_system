"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Moon,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { useTheme } from "@/lib/theme-context";

const ease = [0.22, 1, 0.36, 1] as const;

const benefits = [
  {
    title: "A clearer school day",
    description: "Attendance, classes, and timetables stay in sync for everyone.",
    icon: CalendarCheck,
  },
  {
    title: "Progress you can see",
    description: "Bring grades, exams, and student growth into one view.",
    icon: BarChart3,
  },
  {
    title: "Every family in the loop",
    description: "Give parents a simple way to follow learning and fees.",
    icon: Users,
  },
];

const featureGroups = {
  Administration: [
    { title: "Student records", detail: "Profiles, classes & enrollment", image: "photo-1509062522246-3755977927d7", icon: Users, tag: "01" },
    { title: "Fee management", detail: "Invoices & payment tracking", image: "photo-1523050854058-8df90110c9f1", icon: CreditCard, tag: "02" },
    { title: "School reports", detail: "A clear view of school progress", image: "photo-1454165804606-c3d57bc86b40", icon: BarChart3, tag: "03" },
    { title: "Secure by design", detail: "The right access for every role", image: "photo-1521737711867-e3b97375f902", icon: ShieldCheck, tag: "04" },
  ],
  Teaching: [
    { title: "Daily attendance", detail: "Fast, reliable class registers", image: "photo-1509062522246-3755977927d7", icon: CalendarCheck, tag: "01" },
    { title: "Grades & exams", detail: "Record marks and follow progress", image: "photo-1503676260728-1c00da094a0b", icon: BookOpen, tag: "02" },
    { title: "Class timetable", detail: "Keep lessons and schedules aligned", image: "photo-1509062522246-3755977927d7", icon: CalendarCheck, tag: "03" },
    { title: "Teacher workspace", detail: "Your classes, together in one place", image: "photo-1521737711867-e3b97375f902", icon: Users, tag: "04" },
  ],
  Families: [
    { title: "Parent portal", detail: "See the details that matter", image: "photo-1529390079861-591de354faf5", icon: Users, tag: "01" },
    { title: "Learning progress", detail: "Grades and attendance at a glance", image: "photo-1503676260728-1c00da094a0b", icon: BarChart3, tag: "02" },
    { title: "Fee invoices", detail: "Know what is due and when", image: "photo-1523050854058-8df90110c9f1", icon: CreditCard, tag: "03" },
    { title: "A shared journey", detail: "Keep school and home connected", image: "photo-1529390079861-591de354faf5", icon: GraduationCap, tag: "04" },
  ],
};

type FeatureGroup = keyof typeof featureGroups;

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [activeGroup, setActiveGroup] = useState<FeatureGroup>("Administration");
  const reduceMotion = useReducedMotion();
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section id="platform" className="relative flex min-h-[100svh] items-center justify-center bg-background px-4 py-12 sm:px-8 sm:py-16">
        <button onClick={toggleTheme} className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="Toggle theme">
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <motion.div
          className="grid w-full max-w-[1080px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_32px_90px_-44px_rgba(0,0,0,0.32)] lg:min-h-[610px] lg:grid-cols-2"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          <div className="relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-primary p-7 text-primary-foreground sm:min-h-[330px] sm:p-10 lg:min-h-[610px] lg:p-12">
            <div
              role="img"
              aria-label="Students learning together in a classroom"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/65 to-primary/80" />
            <div className="absolute -right-24 -top-24 size-80 rounded-full border border-primary-foreground/15" />
            <div className="absolute -right-12 -top-12 size-56 rounded-full border border-primary-foreground/15" />
            <Link href="/" aria-label="SchoolPro home" className="relative flex w-fit items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-background text-primary shadow-lg">
                <GraduationCap className="size-6" />
              </span>
              <span className="text-xl font-bold">School<span className="text-primary-foreground/75">Pro</span></span>
            </Link>
            <div className="relative mt-12 max-w-[440px] lg:mt-0">
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-primary-foreground/80">
                <span className="h-px w-7 bg-primary-foreground/60" /> A better way to learn and lead
              </p>
              <h1 className="max-w-[420px] text-3xl font-bold leading-tight sm:text-4xl lg:text-[46px]">
                Let&apos;s grow a brighter future together.
              </h1>
              <p className="mt-4 max-w-[390px] text-sm leading-6 text-primary-foreground/80 sm:text-base sm:leading-7">
                One connected space for students, teachers, families, and the people who keep school moving.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Learning", "Community", "Progress"].map((item) => (
                  <span key={item} className="border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/90">{item}</span>
                ))}
              </div>
            </div>
            <p className="relative mt-8 hidden text-xs text-primary-foreground/65 lg:block">A more connected school starts here.</p>
          </div>

          <div className="flex items-center justify-center px-6 py-9 sm:px-12 sm:py-12 lg:px-14">
            <div className="w-full max-w-[390px]">
              <LoginForm />
            </div>
          </div>
        </motion.div>
      </section>

      <section id="benefits" className="relative z-10 mx-auto grid max-w-7xl gap-px border-y border-border/70 bg-border/70 sm:grid-cols-3">
        {benefits.map(({ title, description, icon: Icon }, index) => (
          <motion.article
            key={title}
            className="group bg-background px-5 py-5 sm:px-7 sm:py-6"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: index * 0.08, ease }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid size-8 place-items-center bg-amber-400/20 text-amber-700"><Icon className="size-4" /></span>
              <h2 className="text-sm font-bold">{title}</h2>
            </div>
            <p className="max-w-[300px] text-xs leading-5 text-muted-foreground">{description}</p>
            <a href="#features" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Explore the platform <ArrowRight className="size-3" /></a>
          </motion.article>
        ))}
      </section>

      <section id="features" className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase text-primary">One school workspace</p>
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">The tools behind a well-run school</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Find the everyday essentials for school leaders, teaching teams, and families.</p>
            </div>
            <div className="flex w-fit items-center gap-1 rounded-lg border border-border bg-background p-1" role="tablist" aria-label="Browse school tools">
            {(Object.keys(featureGroups) as FeatureGroup[]).map((group) => (
              <button
                key={group}
                id={`feature-tab-${group.toLowerCase()}`}
                type="button"
                role="tab"
                aria-controls="feature-panel"
                aria-selected={activeGroup === group}
                tabIndex={activeGroup === group ? 0 : -1}
                onClick={() => setActiveGroup(group)}
                onKeyDown={(event) => {
                  const groups = Object.keys(featureGroups) as FeatureGroup[];
                  const currentIndex = groups.indexOf(group);
                  let nextIndex: number;

                  switch (event.key) {
                    case "ArrowRight":
                      nextIndex = (currentIndex + 1) % groups.length;
                      break;
                    case "ArrowLeft":
                      nextIndex = (currentIndex - 1 + groups.length) % groups.length;
                      break;
                    case "Home":
                      nextIndex = 0;
                      break;
                    case "End":
                      nextIndex = groups.length - 1;
                      break;
                    default:
                      return;
                  }

                  event.preventDefault();
                  setActiveGroup(groups[nextIndex]);
                  document.getElementById(`feature-tab-${groups[nextIndex].toLowerCase()}`)?.focus();
                }}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${activeGroup === group ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {group}
              </button>
            ))}
            </div>
          </div>
        <div id="feature-panel" role="tabpanel" aria-labelledby={`feature-tab-${activeGroup.toLowerCase()}`} tabIndex={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureGroups[activeGroup].map(({ title, detail, image, icon: Icon, tag }, index) => (
            <motion.article
              key={`${activeGroup}-${title}`}
              className="group min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card transition-shadow hover:shadow-lg"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease }}
            >
              <div className="relative h-[175px] overflow-hidden bg-muted">
                <div
                  role="img"
                  aria-label={`${title} in a school setting`}
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url('https://images.unsplash.com/${image}?auto=format&fit=crop&w=700&q=80')` }}
                />
                <span className="absolute left-3 top-3 rounded-sm bg-background/95 px-2 py-1 text-[9px] font-bold uppercase text-foreground">{tag} / {activeGroup}</span>
              </div>
              <div className="flex min-h-[104px] items-start justify-between gap-3 p-4">
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center border border-border text-primary"><Icon className="size-4" /></span>
              </div>
            </motion.article>
          ))}
        </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold"><GraduationCap className="size-5 text-primary" />SchoolPro</Link>
          <p className="text-xs text-muted-foreground">A more connected school starts here.</p>
          <a href="#sign-in" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Sign in <ArrowRight className="size-3" /></a>
        </div>
      </footer>
    </main>
  );
}
