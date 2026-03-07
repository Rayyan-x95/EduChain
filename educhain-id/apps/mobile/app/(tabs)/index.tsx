import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: () => apiFetch<{ data: any }>('/students/me').then((r) => r.data),
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['student', 'stats'],
    queryFn: () => apiFetch<{ data: any }>('/students/me/stats').then((r) => r.data),
    enabled: !!user,
  });

  const displayName = profile?.fullName ?? user?.user_metadata?.full_name ?? 'Student';

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#72E0E3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.name}>{displayName}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Credentials" value={stats?.totalCredentials ?? 0} />
        <StatCard label="Projects" value={stats?.totalProjects ?? 0} />
        <StatCard label="Skills" value={stats?.totalSkills ?? 0} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Text style={styles.placeholder}>
        Tap Credentials to view your verified documents, or Discover to find peers.
      </Text>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f12' },
  content: { padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f12' },
  greeting: { fontSize: 16, color: '#9AA3B2', marginTop: 8 },
  name: { fontSize: 28, fontWeight: '700', color: '#E6EEF3', marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#72E0E3' },
  statLabel: { fontSize: 13, color: '#9AA3B2', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#E6EEF3', marginBottom: 12 },
  placeholder: { fontSize: 14, color: '#9AA3B2', lineHeight: 20 },
});
