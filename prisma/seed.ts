// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = (password: string) => bcrypt.hash(password, 10);

  // ---------- ACADEMIC YEAR ----------
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2026-2027' },
    update: {},
    create: {
      name: '2026-2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      isCurrent: true,
    },
  });

  // ---------- USERS ----------
  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      passwordHash: await hash('Admin@123'),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      gender: 'MALE',
    },
  });

  // Teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@gmail.com' },
    update: {},
    create: {
      email: 'teacher1@gmail.com',
      passwordHash: await hash('Teacher@123'),
      name: 'John Smith',
      role: 'TEACHER',
      gender: 'MALE',
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@gmail.com' },
    update: {},
    create: {
      email: 'teacher2@gmail.com',
      passwordHash: await hash('Teacher@123'),
      name: 'Sarah Johnson',
      role: 'TEACHER',
      gender: 'FEMALE',
    },
  });

  // Accountant
  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@gmail.com' },
    update: {},
    create: {
      email: 'accountant@gmail.com',
      passwordHash: await hash('Account@123'),
      name: 'Michael Lee',
      role: 'ACCOUNTANT',
      gender: 'MALE',
    },
  });

  // Students
  const studentUsers = [
    { email: 'student1@gmail.com', password: 'Student@123', name: 'Alice Wonderland' },
    { email: 'student2@gmail.com', password: 'Student@123', name: 'Bob The Builder' },
    { email: 'student3@gmail.com', password: 'Student@123', name: 'Charlie Brown' },
    { email: 'student4@gmail.com', password: 'Student@123', name: 'Diana Prince' },
    { email: 'student5@gmail.com', password: 'Student@123', name: 'Eve Adams' },
    { email: 'student6@gmail.com', password: 'Student@123', name: 'Frank Miller' },
    { email: 'student7@gmail.com', password: 'Student@123', name: 'Grace Hopper' },
    { email: 'student8@gmail.com', password: 'Student@123', name: 'Henry Carter' },
    { email: 'student9@gmail.com', password: 'Student@123', name: 'Ivy Morgan' },
    { email: 'student10@gmail.com', password: 'Student@123', name: 'Jack Wilson' },
    { email: 'student11@gmail.com', password: 'Student@123', name: 'Kate Davis' },
    { email: 'student12@gmail.com', password: 'Student@123', name: 'Leo Martin' },
  ];

  const createdStudents: any[] = [];
  for (const s of studentUsers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: await hash(s.password),
        name: s.name,
        role: 'STUDENT',
        gender: 'FEMALE',
      },
    });
    createdStudents.push(user);
  }

  // Parents
  const parent1 = await prisma.user.upsert({
    where: { email: 'parent1@gmail.com' },
    update: {},
    create: {
      email: 'parent1@gmail.com',
      passwordHash: await hash('Parent@123'),
      name: 'Mary Johnson',
      role: 'PARENT',
      gender: 'FEMALE',
    },
  });

  const parent2 = await prisma.user.upsert({
    where: { email: 'parent2@gmail.com' },
    update: {},
    create: {
      email: 'parent2@gmail.com',
      passwordHash: await hash('Parent@123'),
      name: 'David Wilson',
      role: 'PARENT',
      gender: 'MALE',
    },
  });

  // ---------- CLASSES ----------
  const classA = await prisma.class.upsert({
    where: { name_section_academicYearId: { name: 'Grade 10', section: 'A', academicYearId: academicYear.id } },
    update: {},
    create: {
      name: 'Grade 10',
      section: 'A',
      academicYearId: academicYear.id,
      roomNumber: '201',
      capacity: 30,
    },
  });

  const classB = await prisma.class.upsert({
    where: { name_section_academicYearId: { name: 'Grade 10', section: 'B', academicYearId: academicYear.id } },
    update: {},
    create: {
      name: 'Grade 10',
      section: 'B',
      academicYearId: academicYear.id,
      roomNumber: '202',
      capacity: 30,
    },
  });

  // ---------- SUBJECTS ----------
  const math = await prisma.subject.upsert({
    where: { code: 'MATH101' },
    update: {},
    create: { name: 'Mathematics', code: 'MATH101', credits: 1 },
  });

  const physics = await prisma.subject.upsert({
    where: { code: 'PHY101' },
    update: {},
    create: { name: 'Physics', code: 'PHY101', credits: 1 },
  });

  const chemistry = await prisma.subject.upsert({
    where: { code: 'CHEM101' },
    update: {},
    create: { name: 'Chemistry', code: 'CHEM101', credits: 1 },
  });

  const biology = await prisma.subject.upsert({
    where: { code: 'BIO101' },
    update: {},
    create: { name: 'Biology', code: 'BIO101', credits: 1 },
  });

  // ---------- TEACHER PROFILES ----------
  const teacherProfile1 = await prisma.teacherProfile.upsert({
    where: { userId: teacher1.id },
    update: {},
    create: {
      userId: teacher1.id,
      employeeId: 'T001',
      hireDate: new Date('2020-08-15'),
      qualification: 'M.Sc. Mathematics',
      specialization: 'Algebra',
    },
  });

  const teacherProfile2 = await prisma.teacherProfile.upsert({
    where: { userId: teacher2.id },
    update: {},
    create: {
      userId: teacher2.id,
      employeeId: 'T002',
      hireDate: new Date('2021-01-10'),
      qualification: 'M.Sc. Physics',
      specialization: 'Mechanics',
    },
  });

  // ---------- CLASS-SUBJECT ASSIGNMENTS ----------
  const classSubject1 = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: classA.id, subjectId: math.id } },
    update: {},
    create: {
      classId: classA.id,
      subjectId: math.id,
      teacherProfileId: teacherProfile1.id,
    },
  });

  const classSubject2 = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: classA.id, subjectId: physics.id } },
    update: {},
    create: {
      classId: classA.id,
      subjectId: physics.id,
      teacherProfileId: teacherProfile2.id,
    },
  });

  const classSubject3 = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: classB.id, subjectId: math.id } },
    update: {},
    create: {
      classId: classB.id,
      subjectId: math.id,
      teacherProfileId: teacherProfile1.id,
    },
  });

  // ---------- STUDENT PROFILES ----------
  const createdStudentProfiles: { id: string }[] = [];
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const classId = i % 2 === 0 ? classA.id : classB.id;
    const rollNumber = `S${(i + 1).toString().padStart(2, '0')}`;
    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        rollNumber: rollNumber,
        dateOfBirth: new Date('2008-01-01'),
        enrollmentDate: new Date('2026-09-01'),
        guardianName: `Guardian ${i+1}`,
        guardianContact: '+1234567890',
        guardianEmail: `guardian${i+1}@gmail.com`, // changed to @gmail.com
        address: '123 School St',
        classId: classId,
      },
    });
    createdStudentProfiles.push(studentProfile);
  }

  // ---------- PARENT-STUDENT LINKS ----------
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent1.id, studentId: createdStudentProfiles[0].id } },
    update: {},
    create: {
      parentId: parent1.id,
      studentId: createdStudentProfiles[0].id,
      relation: 'Mother',
    },
  });

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent2.id, studentId: createdStudentProfiles[1].id } },
    update: {},
    create: {
      parentId: parent2.id,
      studentId: createdStudentProfiles[1].id,
      relation: 'Father',
    },
  });

  // ---------- TIMETABLE ----------
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5];
  let timetableIndex = 0;
  for (const day of days) {
    for (const period of periods) {
      const cs = timetableIndex % 2 === 0 ? classSubject1 : classSubject2;
      await prisma.timetable.upsert({
        where: { dayOfWeek_period_classSubjectId: { dayOfWeek: day, period, classSubjectId: cs.id } },
        update: {},
        create: {
          dayOfWeek: day,
          period,
          classSubjectId: cs.id,
          room: `R${100 + period}`,
        },
      });
      timetableIndex++;
    }
  }

  // ---------- ATTENDANCE ----------
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const studentsInClassA = await prisma.studentProfile.findMany({
    where: { classId: classA.id },
  });

  for (const student of studentsInClassA) {
    await prisma.attendance.upsert({
      where: { studentId_classId_date: { studentId: student.id, classId: classA.id, date: today } },
      update: {},
      create: {
        studentId: student.id,
        classId: classA.id,
        date: today,
        status: 'PRESENT',
        remarks: '',
      },
    });
  }

  // ---------- EXAMS ----------
  const exam1 = await prisma.exam.upsert({
    where: { id: 'exam-midterm' },
    update: {},
    create: {
      id: 'exam-midterm',
      title: 'Mid-Term Exam',
      academicYearId: academicYear.id,
      classId: classA.id,
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-20'),
      maxScore: 100,
      weightage: 40,
    },
  });

  const exam2 = await prisma.exam.upsert({
    where: { id: 'exam-final' },
    update: {},
    create: {
      id: 'exam-final',
      title: 'Final Exam',
      academicYearId: academicYear.id,
      classId: classA.id,
      startDate: new Date('2027-03-15'),
      endDate: new Date('2027-03-20'),
      maxScore: 100,
      weightage: 60,
    },
  });

  // ---------- GRADES ----------
  const studentsInClassAprofiles = await prisma.studentProfile.findMany({
    where: { classId: classA.id },
  });
  for (const student of studentsInClassAprofiles) {
    await prisma.grade.upsert({
      where: { studentId_classSubjectId_examId: { studentId: student.id, classSubjectId: classSubject1.id, examId: exam1.id } },
      update: {},
      create: {
        studentId: student.id,
        classSubjectId: classSubject1.id,
        examId: exam1.id,
        score: Math.floor(Math.random() * 40 + 60),
        remarks: 'Good',
      },
    });
  }

  // ---------- FEE STRUCTURES ----------
  const feeTuition = await prisma.feeStructure.upsert({
    where: { id: 'fee-tuition' },
    update: {},
    create: {
      id: 'fee-tuition',
      name: 'Tuition Fee',
      academicYearId: academicYear.id,
      classId: classA.id,
      amount: 5000,
      frequency: 'TERMLY',
      dueDay: 10,
      isMandatory: true,
    },
  });

  const feeTransport = await prisma.feeStructure.upsert({
    where: { id: 'fee-transport' },
    update: {},
    create: {
      id: 'fee-transport',
      name: 'Transport Fee',
      academicYearId: academicYear.id,
      classId: classA.id,
      amount: 2000,
      frequency: 'MONTHLY',
      dueDay: 5,
      isMandatory: false,
    },
  });

  // ---------- INVOICES & PAYMENTS ----------
  for (const student of studentsInClassAprofiles) {
    await prisma.invoice.upsert({
      where: { id: `inv-${student.id}-tuition` },
      update: {},
      create: {
        id: `inv-${student.id}-tuition`,
        invoiceNumber: `INV-${student.id}-T001`,
        studentId: student.id,
        feeStructureId: feeTuition.id,
        amount: 5000,
        dueDate: new Date('2026-10-10'),
        status: 'UNPAID',
        issueDate: new Date('2026-09-01'),
        description: 'Term 1 Tuition',
      },
    });
  }

  const student1Profile = await prisma.studentProfile.findUnique({
    where: { userId: createdStudents[0].id },
  });
  if (student1Profile) {
    const invoice = await prisma.invoice.findFirst({
      where: { studentId: student1Profile.id },
    });
    if (invoice) {
      await prisma.payment.upsert({
        where: { id: 'payment-1' },
        update: {},
        create: {
          id: 'payment-1',
          invoiceId: invoice.id,
          amount: 5000,
          method: 'CASH',
          transactionId: 'TXN001',
          paymentDate: new Date('2026-09-05'),
          receiptNumber: 'REC-001',
          notes: 'First installment',
        },
      });
    }
  }

  // ---------- ANNOUNCEMENTS ----------
  await prisma.announcement.upsert({
    where: { id: 'announcement-1' },
    update: {},
    create: {
      id: 'announcement-1',
      title: 'School Reopening',
      content: 'School will reopen on September 1st for the new academic year.',
      targetRole: 'STUDENT',
      targetClassId: classA.id,
      authorId: adminUser.id,
      isImportant: true,
      pinned: true,
      createdAt: new Date('2026-08-20'),
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'announcement-2' },
    update: {},
    create: {
      id: 'announcement-2',
      title: 'Parent-Teacher Meeting',
      content: 'Parent-teacher meeting scheduled for October 5th at 4 PM.',
      targetRole: 'PARENT',
      authorId: adminUser.id,
      isImportant: false,
      pinned: false,
      expiresAt: new Date('2026-10-06'),
      createdAt: new Date('2026-09-25'),
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });