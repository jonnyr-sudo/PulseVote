import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useStore } from '../services/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Answer'>;

export const AnswerScreen = ({ navigation, route }: Props) => {
  const { questionId } = route.params;
  const { questions, answerQuestion } = useStore();
  const [note, setNote] = useState('');

  const question = useMemo(() => questions.find((q) => q.id === questionId), [questionId, questions]);

  if (!question) {
    return <View style={styles.container}><Text>Question not found.</Text></View>;
  }

  const onAnswer = async (choice: 'A' | 'B') => {
    await answerQuestion(questionId, choice, note);
    Alert.alert('Saved', 'Response logged.');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.buttonRow}>
        <Pressable style={[styles.answerButton, styles.aButton]} onPress={() => onAnswer('A')}>
          <Text style={styles.answerText}>{question.optionA}</Text>
        </Pressable>
        <Pressable style={[styles.answerButton, styles.bButton]} onPress={() => onAnswer('B')}>
          <Text style={styles.answerText}>{question.optionB}</Text>
        </Pressable>
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Optional note"
        multiline
        style={styles.noteInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc', gap: 16 },
  prompt: { fontSize: 24, fontWeight: '700' },
  buttonRow: { gap: 12 },
  answerButton: { minHeight: 110, borderRadius: 14, justifyContent: 'center', padding: 20 },
  aButton: { backgroundColor: '#2563eb' },
  bButton: { backgroundColor: '#7c3aed' },
  answerText: { color: 'white', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  noteInput: {
    minHeight: 100,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    textAlignVertical: 'top',
  },
});
