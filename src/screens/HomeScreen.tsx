import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStore } from '../services/store';
import { getQuestionStatus } from '../utils/schedule';
import { StatusChip } from '../components/StatusChip';
import { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { questions, responses } = useStore();

  const activeQuestions = useMemo(() => {
    return questions
      .filter((q) => q.isActive)
      .map((question) => ({ question, status: getQuestionStatus(question, responses) }))
      .sort((a, b) => (a.status.kind === 'pending' ? -1 : b.status.kind === 'pending' ? 1 : 0));
  }, [questions, responses]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>PulseVote</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('CreateQuestion')}>
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>
      <FlatList
        data={activeQuestions}
        keyExtractor={(item) => item.question.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>No active questions yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate(item.status.kind === 'pending' ? 'Answer' : 'Insights', { questionId: item.question.id })}
            style={styles.card}
          >
            <Text style={styles.prompt}>{item.question.prompt}</Text>
            <StatusChip status={item.status} />
          </Pressable>
        )}
      />
      <Pressable style={styles.insightsButton} onPress={() => navigation.navigate('InsightsList')}>
        <Text style={styles.insightsButtonText}>View Insights</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  addButtonText: { color: 'white', fontWeight: '700' },
  list: { paddingVertical: 16, gap: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, gap: 10 },
  prompt: { fontSize: 18, fontWeight: '600' },
  insightsButton: { alignSelf: 'center', padding: 10 },
  insightsButtonText: { color: '#1d4ed8', fontWeight: '600' },
});
