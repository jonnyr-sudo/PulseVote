import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useStore } from '../services/store';

type Props = NativeStackScreenProps<RootStackParamList, 'InsightsList'>;

export const InsightsListScreen = ({ navigation }: Props) => {
  const { questions } = useStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => navigation.navigate('Insights', { questionId: item.id })}>
            <Text style={styles.prompt}>{item.prompt}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  item: { backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 10 },
  prompt: { fontWeight: '600' },
});
