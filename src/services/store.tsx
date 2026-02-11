import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addResponse, getQuestions, getResponses, initializeDatabase, upsertQuestion } from '../db/database';
import { Question, Response, ResponseChoice } from '../types/models';
import { ensureAllQuestionNotifications, requestNotificationPermission, scheduleQuestionNotifications } from './notifications';

type AppStore = {
  questions: Question[];
  responses: Response[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveQuestion: (question: Question) => Promise<void>;
  answerQuestion: (questionId: string, choice: ResponseChoice, note?: string) => Promise<void>;
};

const StoreContext = createContext<AppStore | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [q, r] = await Promise.all([getQuestions(), getResponses()]);
    setQuestions(q);
    setResponses(r);
  }, []);

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      await requestNotificationPermission();
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    if (!loading) {
      ensureAllQuestionNotifications(questions);
    }
  }, [loading, questions]);

  const saveQuestion = useCallback(async (question: Question) => {
    await upsertQuestion(question);
    await scheduleQuestionNotifications(question);
    await refresh();
  }, [refresh]);

  const answerQuestion = useCallback(async (questionId: string, choice: ResponseChoice, note?: string) => {
    await addResponse(questionId, choice, note);
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ questions, responses, loading, refresh, saveQuestion, answerQuestion }),
    [questions, responses, loading, refresh, saveQuestion, answerQuestion],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): AppStore => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
};
