export type ScheduleType = 'daily' | 'weekly';

export type Question = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  scheduleType: ScheduleType;
  daysOfWeek: number[];
  windowStartTime: string;
  windowEndTime: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type ResponseChoice = 'A' | 'B';

export type Response = {
  id: string;
  questionId: string;
  timestamp: string;
  choice: ResponseChoice;
  note?: string | null;
};

export type QuestionStatus =
  | { kind: 'pending' }
  | { kind: 'answeredToday' }
  | { kind: 'nextDue'; date: Date };
