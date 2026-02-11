import { Question, QuestionStatus, Response } from '../types/models';

export const DEFAULT_WINDOW_START = '18:00';
export const DEFAULT_WINDOW_END = '21:00';

export const toDateOnlyString = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseTime = (hhmm: string): { hour: number; minute: number } => {
  const [hour, minute] = hhmm.split(':').map((v) => Number(v));
  return { hour, minute };
};

export const dateAtLocalTime = (date: Date, hhmm: string): Date => {
  const { hour, minute } = parseTime(hhmm);
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
};

const isWithinDateRange = (question: Question, date: Date): boolean => {
  const d = toDateOnlyString(date);
  return d >= question.startDate && d <= question.endDate;
};

const isDueBySchedule = (question: Question, date: Date): boolean => {
  if (question.scheduleType === 'daily') return true;
  return question.daysOfWeek.includes(date.getDay());
};

export const isQuestionDueOnDate = (question: Question, date: Date): boolean => {
  if (!question.isActive) return false;
  if (!isWithinDateRange(question, date)) return false;
  return isDueBySchedule(question, date);
};

export const hasResponseForDate = (
  responses: Response[],
  questionId: string,
  date: Date,
): boolean => {
  const day = toDateOnlyString(date);
  return responses.some((response) => {
    const responseDay = toDateOnlyString(new Date(response.timestamp));
    return response.questionId === questionId && responseDay === day;
  });
};

export const findNextDueDate = (question: Question, now = new Date()): Date => {
  const cursor = new Date(now);
  for (let i = 0; i < 400; i += 1) {
    if (isQuestionDueOnDate(question, cursor)) {
      const windowStart = dateAtLocalTime(cursor, question.windowStartTime);
      if (windowStart >= now) return windowStart;
    }
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
  }
  return dateAtLocalTime(now, question.windowStartTime);
};

export const getQuestionStatus = (
  question: Question,
  responses: Response[],
  now = new Date(),
): QuestionStatus => {
  const dueToday = isQuestionDueOnDate(question, now);
  const windowStart = dateAtLocalTime(now, question.windowStartTime);
  const windowEnd = dateAtLocalTime(now, question.windowEndTime);

  if (dueToday && now >= windowStart && now <= windowEnd) {
    if (hasResponseForDate(responses, question.id, now)) {
      return { kind: 'answeredToday' };
    }
    return { kind: 'pending' };
  }

  if (dueToday && hasResponseForDate(responses, question.id, now)) {
    return { kind: 'answeredToday' };
  }

  return { kind: 'nextDue', date: findNextDueDate(question, now) };
};

export const createDefaultQuestionDates = (): { startDate: string; endDate: string } => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 365);
  return {
    startDate: toDateOnlyString(start),
    endDate: toDateOnlyString(end),
  };
};
