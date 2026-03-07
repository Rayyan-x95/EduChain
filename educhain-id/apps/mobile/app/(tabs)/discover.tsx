import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth';

interface StudentResult {
  id: string;
  fullName: string;
  institution?: string;
  skills: string[];
}

export default function DiscoverScreen() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', 'students', query],
    queryFn: () =>
      apiFetch<{ data: { students: StudentResult[] } }>(
        `/search/students?q=${encodeURIComponent(query)}`,
      ).then((r) => r.data.students),
    enabled: !!user && query.length >= 2,
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search students by name or skill…"
        placeholderTextColor="#9AA3B260"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {(isLoading || isFetching) && query.length >= 2 && (
        <ActivityIndicator style={styles.loader} color="#72E0E3" />
      )}

      {data && data.length === 0 && query.length >= 2 && (
        <Text style={styles.empty}>No students found for "{query}"</Text>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.fullName}</Text>
            {item.institution && <Text style={styles.meta}>{item.institution}</Text>}
            {item.skills.length > 0 && (
              <View style={styles.skillRow}>
                {item.skills.slice(0, 4).map((s) => (
                  <View key={s} style={styles.chip}>
                    <Text style={styles.chipText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f12' },
  input: {
    margin: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#E6EEF3',
  },
  loader: { marginVertical: 12 },
  empty: { textAlign: 'center', color: '#9AA3B2', marginTop: 24, fontSize: 14 },
  list: { paddingHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  name: { fontSize: 16, fontWeight: '600', color: '#E6EEF3' },
  meta: { fontSize: 13, color: '#9AA3B2', marginTop: 2 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: 'rgba(114,224,227,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: { fontSize: 12, color: '#72E0E3', fontWeight: '500' },
});
