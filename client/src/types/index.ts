export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Job {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string | null;
  jobType: JobType;
  status: JobStatus;
  salary: string | null;
  jobUrl: string | null;
  description: string | null;
  companyLogo: string | null;
  companyWebsite: string | null;
  companySize: string | null;
  industry: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  resumeId: string | null;
  atsScore: number | null;
  coverLetter: string | null;
  notes?: Note[];
  interviews?: Interview[];
  resume?: Resume;
  _count?: { notes: number; interviews: number };
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type JobStatus = 'SAVED' | 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'OFFER' | 'REJECTED' | 'WITHDRAWN' | 'ACCEPTED';

export interface Resume {
  id: string;
  userId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  parsedText: string | null;
  aiReview: string | null;
  createdAt: string;
  updatedAt: string;
  jobs?: Job[];
  _count?: { jobs: number };
}

export interface Interview {
  id: string;
  jobId: string;
  userId: string;
  type: InterviewType;
  scheduledAt: string;
  duration: number | null;
  location: string | null;
  meetingUrl: string | null;
  status: InterviewStatus;
  feedback: string | null;
  questions?: InterviewQuestion[];
  job?: { id: string; company: string; position: string };
  _count?: { questions: number };
  createdAt: string;
  updatedAt: string;
}

export type InterviewType = 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  question: string;
  answer: string | null;
  aiGenerated: boolean;
  category: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  jobId: string | null;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  job?: { id: string; company: string; position: string } | null;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  color: string | null;
  type: EventType;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'INTERVIEW' | 'DEADLINE' | 'FOLLOW_UP' | 'CUSTOM';
