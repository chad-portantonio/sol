export interface Student {
  id: string;
  userId?: string | null;
  email: string;
  fullName: string;
  preferredSubjects: string[];
  gradeLevel?: string | null;
  bio?: string | null;
  active: boolean;
  
  // Legacy fields for backward compatibility
  tutorId?: string | null;
  subject?: string | null;
  year?: string | null;
  parentEmail?: string | null;
  parentLinkToken?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
  sessions?: Session[];
}

export interface Session {
  id: string;
  studentId: string;
  tutorId?: string | null;
  connectionId?: string | null;
  title?: string | null;
  subject: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes?: string | null;
  homework?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tutor {
  id: string;
  userId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  students?: Student[];
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  tutorId: string;
  status: string;
  stripeCustomerId: string;
  stripeSubId: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}
