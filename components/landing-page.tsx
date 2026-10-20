"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 border-b border-border/70 bg-background/95">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="SchoolPro home" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-[19px] font-extrabold tracking-tight">School<span className="text-primary">Pro</span></span>
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] font-medium text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-foreground" href="#platform">Platform <ChevronDown className="ml-1 inline size-3" /></a>
            <a className="transition-colors hover:text-foreground" href="#features">For schools</a>
            <a className="transition-colors hover:text-foreground" href="#benefits">Why SchoolPro</a>
            <a className="transition-colors hover:text-foreground" href="#contact">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="grid size-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm" className="hidden rounded-sm px-4 sm:inline-flex"><Link href="/login">Login / Register</Link></Button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-9 place-items-center rounded-sm md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" className="absolute left-0 right-0 top-full grid gap-1 border-b bg-background px-5 py-3 shadow-lg md:hidden" aria-label="Mobile navigation">
            <a onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm" href="#platform">Platform</a>
            <a onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm" href="#features">For schools</a>
            <a onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm" href="#benefits">Why SchoolPro</a>
            <a onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm" href="#contact">Contact</a>
            <Link onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm" href="/login">Login / Register</Link>
          </nav>
        )}
      </header>

      <section id="platform" className="relative mx-auto grid max-w-7xl items-center gap-7 px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:min-h-[530px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-3 lg:pb-6 lg:pt-10">
        <motion.div
          className="relative z-10 max-w-[570px]"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-7 bg-primary" /> A better way to run school
          </p>
          <h1 className="max-w-[560px] text-[42px] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-[56px] lg:text-[62px]">
            Education that prepares you for <span className="text-primary">what’s next.</span>
          </h1>
          <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-muted-foreground sm:text-base">
            Make every school day work better. Bring students, teachers, and families together around the moments that matter.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 rounded-sm px-5 text-sm">
              <Link href="/login">Explore SchoolPro <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <a href="#features" className="px-3 py-2 text-sm font-semibold transition-colors hover:text-primary">See what’s included</a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> Built for every school role</span>
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" /> All your essentials, connected</span>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto h-[340px] w-full max-w-[610px] sm:h-[420px] lg:h-[465px]"
          initial={reduceMotion ? false : { opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease }}
        >
          <div className="absolute inset-x-0 bottom-0 top-5 overflow-hidden rounded-t-[46%] bg-[#dcecf4] sm:left-8">
            <div
              role="img"
              aria-label="Students learning together in a bright classroom"
              className="h-full w-full bg-cover bg-[center_35%]"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
          </div>
          <div className="absolute right-1 top-12 grid size-12 place-items-center bg-primary text-primary-foreground shadow-lg sm:right-2 sm:top-16">
            <GraduationCap className="size-6" />
          </div>
          <motion.div
            className="absolute bottom-7 left-0 flex min-w-[222px] items-center gap-3 border border-border/70 bg-background px-4 py-3 shadow-[0_12px_32px_rgba(20,35,48,0.14)] sm:bottom-11 sm:left-2"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="grid size-11 shrink-0 place-items-center bg-amber-400 text-amber-950"><BarChart3 className="size-5" /></span>
            <span><strong className="block text-[25px] font-extrabold leading-none">One</strong><span className="mt-1 block text-xs font-medium text-muted-foreground">connected school community</span></span>
          </motion.div>
          <div className="absolute bottom-[115px] right-0 hidden max-w-[205px] border border-border/70 bg-background/95 p-3 shadow-lg sm:block">
            <div className="mb-2 flex -space-x-2" aria-hidden="true">
              <span className="size-7 rounded-full border-2 border-background bg-[#e0a789]" />
              <span className="size-7 rounded-full border-2 border-background bg-[#98b6a4]" />
              <span className="size-7 rounded-full border-2 border-background bg-[#d5b977]" />
              <span className="grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-[9px] font-bold text-white">+</span>
            </div>
            <p className="text-xs font-bold">Every voice has a place</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Admins, teachers, students, and families.</p>
          </div>
        </motion.div>
      </section>

      <section id="benefits" className="relative z-10 mx-auto grid max-w-7xl gap-px border-y border-border/70 bg-border/70 sm:grid-cols-3 lg:-mt-1">
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

      <section id="features" className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">The SchoolPro platform</p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.025em] sm:text-[40px]">Everything your school needs.<br className="hidden sm:block" /> Nothing in the way.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Purpose-built tools for the people who make a school work, all in one connected place.</p>
        </div>
        <div className="mb-6 flex justify-center overflow-x-auto">
          <div className="flex min-w-max items-center gap-1 border-b border-border" role="tablist" aria-label="Browse school tools">
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
                className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${activeGroup === group ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
        <div id="feature-panel" role="tabpanel" aria-labelledby={`feature-tab-${activeGroup.toLowerCase()}`} tabIndex={0} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featureGroups[activeGroup].map(({ title, detail, image, icon: Icon, tag }, index) => (
            <motion.article
              key={`${activeGroup}-${title}`}
              className="group min-w-0 overflow-hidden border border-border/70 bg-card"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease }}
            >
              <div className="relative h-[155px] overflow-hidden bg-muted">
                <div
                  role="img"
                  aria-label={`${title} in a school setting`}
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url('https://images.unsplash.com/${image}?auto=format&fit=crop&w=700&q=80')` }}
                />
                <span className="absolute left-3 top-3 bg-amber-400 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-950">{tag} / {activeGroup}</span>
              </div>
              <div className="flex min-h-[94px] items-start justify-between gap-3 p-4">
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center border border-border text-primary"><Icon className="size-4" /></span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold"><GraduationCap className="size-5 text-primary" />SchoolPro</Link>
          <p className="text-xs text-muted-foreground">A more connected school starts here.</p>
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Login / Register <ArrowRight className="size-3" /></Link>
        </div>
      </footer>
    </main>
  );
}
