// app/(dashboard)/help/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  MessageCircle,
  BookOpen,
  Video,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  HelpCircle,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I add a new student?",
      answer:
        "Go to Students → Add Student, fill in the required details (name, email, date of birth, guardian info, class), and click 'Create Student'. The student will be registered and can log in.",
    },
    {
      question: "How do I mark attendance?",
      answer:
        "Go to Attendance → Mark Attendance, select a class and date, then choose the status (Present, Absent, Late, Excused) for each student. Click 'Save Attendance' to confirm.",
    },
    {
      question: "How do I create an invoice?",
      answer:
        "Go to Fees → Create Invoice, select a student and a fee structure. The amount auto-fills, but you can edit it. Set the due date, status, and optional late fee, then click 'Create Invoice'.",
    },
    {
      question: "What do the different user roles do?",
      answer:
        "• SUPER_ADMIN: Full system control.\n• SCHOOL_ADMIN: Manage students, teachers, classes, attendance, fees, and reports.\n• TEACHER: Mark attendance, enter grades, view their classes.\n• STUDENT: View schedule, grades, fee status.\n• PARENT: View their child's progress.\n• ACCOUNTANT: Manage invoices and payments.",
    },
    {
      question: "How do I change my password?",
      answer:
        "Go to Settings → Profile, scroll to 'Change Password', enter your current password and the new password twice. Click 'Change Password' to update.",
    },
    {
      question: "How do I set the current academic year?",
      answer:
        "Go to Settings → Academic Years, find the year you want to set as current, and click 'Set Current' next to it. Only one year can be current at a time.",
    },
  ];

  const quickLinks = [
    {
      title: "Student Guide",
      icon: Users,
      href: "#",
      description: "How to manage student records",
    },
    {
      title: "Teacher Guide",
      icon: GraduationCap,
      href: "#",
      description: "Attendance, grades, and classes",
    },
    {
      title: "Fees & Invoices",
      icon: DollarSign,
      href: "#",
      description: "Create and track payments",
    },
    {
      title: "Attendance",
      icon: Calendar,
      href: "#",
      description: "Mark and view attendance",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and get started with the system.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Card key={link.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">{link.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{link.description}</p>
              <Button variant="link" className="px-0 h-auto text-sm mt-1" asChild>
                <Link href={link.href}>Learn more →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to the most common questions about the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact & Resources */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Need additional help? Reach out to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">support@schoolpro.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Live chat (available 9am–5pm EST)</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Documentation: <Link href="#" className="text-primary hover:underline">docs.schoolpro.com</Link></span>
            </div>
            <form className="space-y-3 pt-2">
              <Label htmlFor="support-message">Send us a message</Label>
              <Input id="support-message" placeholder="Describe your issue..." />
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Resources
            </CardTitle>
            <CardDescription>
              Additional materials to help you get the most out of the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="#">
                <BookOpen className="mr-2 h-4 w-4" />
                User Manual (PDF)
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="#">
                <Video className="mr-2 h-4 w-4" />
                Video Tutorials
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="#">
                <FileText className="mr-2 h-4 w-4" />
                API Documentation
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="#">
                <Users className="mr-2 h-4 w-4" />
                Community Forum
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}