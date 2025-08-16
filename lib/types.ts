export interface Student {
  id: string;
  tutorId?: string | null;
  fullName: string;
  subject: string;
  year: string;
  active: boolean;
  parentEmail: string | null;
  parentLinkToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
  sessions?: Session[];
}

export interface Session {
  id: string;
  studentId: string;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  homework: string | null;
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
