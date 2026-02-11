import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useStore } from '../services/store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;

export const InsightsScreen = ({ route }: Props) => {
  const { questionId } = route.params;
  const { questions, responses } = useStore();

  const question = useMemo(() => questions.find((q) => q.id === questionId), [questionId, questions]);
  const questionResponses = useMemo(
    () => responses.filter((response) => response.questionId === questionId),
    [questionId, responses],
  );

  const counts = useMemo(() => {
    const a = questionResponses.filter((r) => r.choice === 'A').length;
    const b = questionResponses.filter((r) => r.choice === 'B').length;
    const total = questionResponses.length;
    return { a, b, total };
  }, [questionResponses]);

  const last30 = useMemo(() => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    const recent = questionResponses.filter((r) => new Date(r.timestamp) >= threshold);
    return {
      a: recent.filter((r) => r.choice === 'A').length,
      b: recent.filter((r) => r.choice === 'B').length,
    };
  }, [questionResponses]);

  const exportCsv = async () => {
    const rows = ['id,questionId,timestamp,choice,note'];
    questionResponses.forEach((response) => {
      const note = (response.note ?? '').replaceAll('"', '""');
      rows.push(`${response.id},${response.questionId},${response.timestamp},${response.choice},"${note}"`);
    });
    const csv = rows.join('\n');
    const fileUri = `${FileSystem.cacheDirectory}pulsevote-${questionId}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable on this device.');
      return;
    }
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
  };

  if (!question) return <View style={styles.container}><Text>Question not found.</Text></View>;

  const pctA = counts.total ? Math.round((counts.a / counts.total) * 100) : 0;
  const pctB = counts.total ? Math.round((counts.b / counts.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{question.prompt}</Text>
      <View style={styles.card}>
        <Text style={styles.row}>Total A: {counts.a} ({pctA}%)</Text>
        <Text style={styles.row}>Total B: {counts.b} ({pctB}%)</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Last 30 days</Text>
        <Text style={styles.row}>A: {last30.a}</Text>
        <Text style={styles.row}>B: {last30.b}</Text>
      </View>
      <Pressable style={styles.exportButton} onPress={exportCsv}>
        <Text style={styles.exportText}>Export CSV</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc', gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 14 },
  row: { fontSize: 16, marginBottom: 4 },
  exportButton: { backgroundColor: '#0f766e', padding: 14, borderRadius: 10, marginTop: 8 },
  exportText: { color: 'white', textAlign: 'center', fontWeight: '700' },
});
