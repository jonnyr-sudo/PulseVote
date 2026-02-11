import * as SQLite from 'expo-sqlite';
import { Question, Response, ResponseChoice } from '../types/models';
import { makeId } from '../utils/id';

const dbPromise = SQLite.openDatabaseAsync('pulsevote.db');

export const initializeDatabase = async (): Promise<void> => {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY NOT NULL,
      prompt TEXT NOT NULL,
      optionA TEXT NOT NULL,
      optionB TEXT NOT NULL,
      scheduleType TEXT NOT NULL,
      daysOfWeek TEXT NOT NULL,
      windowStartTime TEXT NOT NULL,
      windowEndTime TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      isActive INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY NOT NULL,
      questionId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      choice TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (questionId) REFERENCES questions(id)
    );
  `);
};

const mapQuestion = (row: any): Question => ({
  id: row.id,
  prompt: row.prompt,
  optionA: row.optionA,
  optionB: row.optionB,
  scheduleType: row.scheduleType,
  daysOfWeek: JSON.parse(row.daysOfWeek),
  windowStartTime: row.windowStartTime,
  windowEndTime: row.windowEndTime,
  startDate: row.startDate,
  endDate: row.endDate,
  isActive: Boolean(row.isActive),
});

export const getQuestions = async (): Promise<Question[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync('SELECT * FROM questions');
  return rows.map(mapQuestion);
};

export const getResponses = async (): Promise<Response[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync('SELECT * FROM responses ORDER BY timestamp DESC');
  return rows.map((row: any) => ({
    id: row.id,
    questionId: row.questionId,
    timestamp: row.timestamp,
    choice: row.choice,
    note: row.note,
  }));
};

export const getResponsesForQuestion = async (questionId: string): Promise<Response[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync('SELECT * FROM responses WHERE questionId = ? ORDER BY timestamp DESC', [questionId]);
  return rows.map((row: any) => ({
    id: row.id,
    questionId: row.questionId,
    timestamp: row.timestamp,
    choice: row.choice,
    note: row.note,
  }));
};

export const upsertQuestion = async (question: Question): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(
    `INSERT OR REPLACE INTO questions (
      id, prompt, optionA, optionB, scheduleType, daysOfWeek, windowStartTime,
      windowEndTime, startDate, endDate, isActive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      question.id,
      question.prompt,
      question.optionA,
      question.optionB,
      question.scheduleType,
      JSON.stringify(question.daysOfWeek),
      question.windowStartTime,
      question.windowEndTime,
      question.startDate,
      question.endDate,
      question.isActive ? 1 : 0,
    ],
  );
};

export const addResponse = async (
  questionId: string,
  choice: ResponseChoice,
  note?: string,
): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(
    'INSERT INTO responses (id, questionId, timestamp, choice, note) VALUES (?, ?, ?, ?, ?)',
    [makeId(), questionId, new Date().toISOString(), choice, note ?? null],
  );
};
