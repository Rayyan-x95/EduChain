import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth';

interface Credential {
  id: string;
  title: string;
  type: string;
  status: string;
  issuedAt: string;
  institution?: { name: string };
}

export default function CredentialsScreen() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['credentials', 'mine'],
    queryFn: () =>
      apiFetch<{ data: { credentials: Credential[] } }>('/credentials/me').then(
        (r) => r.data.credentials,
      ),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#72E0E3" />
      </View>
    );
  }

  if (!data?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No Credentials Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your verified credentials will appear here once issued.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.cardMeta}>{item.type}</Text>
          {item.institution?.name && (
            <Text style={styles.cardMeta}>{item.institution.name}</Text>
          )}
          <Text style={styles.cardDate}>
            Issued {new Date(item.issuedAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#34D399',
    pending: '#FBBF24',
    revoked: '#EF4444',
  };
  return (
    <View style={[styles.badge, { backgroundColor: (colors[status] ?? '#9AA3B2') + '20' }]}>
      <Text style={[styles.badgeText, { color: colors[status] ?? '#9AA3B2' }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f12' },
  list: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f12', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#E6EEF3', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9AA3B2', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#E6EEF3', flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 13, color: '#9AA3B2', marginBottom: 2 },
  cardDate: { fontSize: 12, color: '#9AA3B260', marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
