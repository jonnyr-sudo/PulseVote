import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QuestionStatus } from '../types/models';

const formatNextDue = (date: Date): string =>
  date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const StatusChip = ({ status }: { status: QuestionStatus }) => {
  if (status.kind === 'pending') return <View style={[styles.chip, styles.pending]}><Text style={styles.text}>Pending</Text></View>;
  if (status.kind === 'answeredToday') return <View style={[styles.chip, styles.answered]}><Text style={styles.text}>Answered</Text></View>;

  return (
    <View style={[styles.chip, styles.nextDue]}>
      <Text style={styles.text}>Next due: {formatNextDue(status.date)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  text: { color: 'white', fontWeight: '600' },
  pending: { backgroundColor: '#d97706' },
  answered: { backgroundColor: '#16a34a' },
  nextDue: { backgroundColor: '#6b7280' },
});
