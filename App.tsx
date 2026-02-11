import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { CreateQuestionScreen } from './src/screens/CreateQuestionScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AnswerScreen } from './src/screens/AnswerScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { InsightsListScreen } from './src/screens/InsightsListScreen';
import { RootStackParamList } from './src/screens/types';
import { StoreProvider } from './src/services/store';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navRef = createNavigationContainerRef<RootStackParamList>();

const AppNavigator = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const questionId = response.notification.request.content.data?.questionId as string | undefined;
      if (questionId && navRef.isReady()) {
        navRef.navigate('Answer', { questionId });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateQuestion" component={CreateQuestionScreen} options={{ title: 'Create Question' }} />
        <Stack.Screen name="Answer" component={AnswerScreen} options={{ title: 'Answer' }} />
        <Stack.Screen name="InsightsList" component={InsightsListScreen} options={{ title: 'Insights' }} />
        <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: 'Question Insights' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppNavigator />
    </StoreProvider>
  );
}
