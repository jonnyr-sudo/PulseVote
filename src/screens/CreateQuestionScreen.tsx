import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { createDefaultQuestionDates, DEFAULT_WINDOW_END, DEFAULT_WINDOW_START } from '../utils/schedule';
import { makeId } from '../utils/id';
import { useStore } from '../services/store';
import { Question } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateQuestion'>;

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CreateQuestionScreen = ({ navigation }: Props) => {
  const defaults = useMemo(() => createDefaultQuestionDates(), []);
  const { saveQuestion } = useStore();

  const [prompt, setPrompt] = useState('');
  const [optionA, setOptionA] = useState('Yes');
  const [optionB, setOptionB] = useState('No');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [windowStartTime, setWindowStartTime] = useState(DEFAULT_WINDOW_START);
  const [windowEndTime, setWindowEndTime] = useState(DEFAULT_WINDOW_END);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [isActive, setIsActive] = useState(true);

  const toggleDay = (day: number) => {
    setDaysOfWeek((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort(),
    );
  };

  const onSave = async () => {
    if (!prompt.trim()) {
      Alert.alert('Prompt required', 'Please enter your reflection question.');
      return;
    }

    const question: Question = {
      id: makeId(),
      prompt: prompt.trim(),
      optionA: optionA.trim() || 'A',
      optionB: optionB.trim() || 'B',
      scheduleType,
      daysOfWeek,
      windowStartTime,
      windowEndTime,
      startDate,
      endDate,
      isActive,
    };

    await saveQuestion(question);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Question</Text>
      <TextInput value={prompt} onChangeText={setPrompt} style={styles.input} placeholder="Did I focus on what matters today?" />

      <Text style={styles.label}>Option A</Text>
      <TextInput value={optionA} onChangeText={setOptionA} style={styles.input} />

      <Text style={styles.label}>Option B</Text>
      <TextInput value={optionB} onChangeText={setOptionB} style={styles.input} />

      <Pressable onPress={() => setShowAdvanced((x) => !x)}>
        <Text style={styles.advancedHeader}>{showAdvanced ? 'Hide' : 'Show'} advanced settings</Text>
      </Pressable>

      {showAdvanced && (
        <View style={styles.advancedBlock}>
          <Text style={styles.label}>Schedule</Text>
          <View style={styles.row}>
            <Pressable style={[styles.pill, scheduleType === 'daily' && styles.pillSelected]} onPress={() => setScheduleType('daily')}>
              <Text>Daily</Text>
            </Pressable>
            <Pressable style={[styles.pill, scheduleType === 'weekly' && styles.pillSelected]} onPress={() => setScheduleType('weekly')}>
              <Text>Weekly</Text>
            </Pressable>
          </View>

          {scheduleType === 'weekly' && (
            <View style={styles.rowWrap}>
              {dayLabels.map((label, day) => (
                <Pressable key={label} style={[styles.pill, daysOfWeek.includes(day) && styles.pillSelected]} onPress={() => toggleDay(day)}>
                  <Text>{label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Window Start (HH:MM)</Text>
          <TextInput value={windowStartTime} onChangeText={setWindowStartTime} style={styles.input} />
          <Text style={styles.label}>Window End (HH:MM)</Text>
          <TextInput value={windowEndTime} onChangeText={setWindowEndTime} style={styles.input} />

          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput value={startDate} onChangeText={setStartDate} style={styles.input} />
          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput value={endDate} onChangeText={setEndDate} style={styles.input} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Active</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        </View>
      )}

      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Question</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  label: { fontWeight: '600' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  advancedHeader: { color: '#1d4ed8', marginVertical: 8, fontWeight: '600' },
  advancedBlock: { gap: 8, paddingTop: 4 },
  row: { flexDirection: 'row', gap: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#94a3b8' },
  pillSelected: { backgroundColor: '#bfdbfe' },
  saveButton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 12, marginTop: 8 },
  saveButtonText: { color: 'white', textAlign: 'center', fontWeight: '700' },
});
