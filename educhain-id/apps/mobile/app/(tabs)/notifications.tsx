import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiFetch<{ data: { notifications: Notification[] } }>('/notifications').then(
        (r) => r.data.notifications,
      ),
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
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
        <Text style={styles.emptyTitle}>All Caught Up</Text>
        <Text style={styles.emptySubtitle}>You have no notifications.</Text>
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
        <Pressable
          style={[styles.card, !item.read && styles.unread]}
          onPress={() => !item.read && markRead.mutate(item.id)}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </Pressable>
      )}
    />
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
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: '#72E0E3',
  },
  title: { fontSize: 15, fontWeight: '600', color: '#E6EEF3', marginBottom: 4 },
  message: { fontSize: 13, color: '#9AA3B2', lineHeight: 18 },
  date: { fontSize: 11, color: '#9AA3B260', marginTop: 8 },
});
