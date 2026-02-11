import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Question } from '../types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const parseTime = (time: string): { hour: number; minute: number } => {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const request = await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return request.granted;
};

export const cancelQuestionNotifications = async (questionId: string): Promise<void> => {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((notification) => notification.content.data?.questionId === questionId)
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
};

export const scheduleQuestionNotifications = async (question: Question): Promise<void> => {
  await cancelQuestionNotifications(question.id);

  if (!question.isActive) return;

  const { hour, minute } = parseTime(question.windowStartTime);

  if (question.scheduleType === 'daily') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'PulseVote reminder',
        body: question.prompt,
        data: { questionId: question.id, screen: 'Answer' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    return;
  }

  for (const weekday of question.daysOfWeek) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'PulseVote reminder',
        body: question.prompt,
        data: { questionId: question.id, screen: 'Answer' },
      },
      trigger: {
        weekday: weekday + 1,
        hour,
        minute,
        repeats: true,
      },
    });
  }
};

export const ensureAllQuestionNotifications = async (questions: Question[]): Promise<void> => {
  await Promise.all(questions.map((q) => scheduleQuestionNotifications(q)));
};
