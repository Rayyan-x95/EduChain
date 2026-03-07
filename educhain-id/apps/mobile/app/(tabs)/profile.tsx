import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: () => apiFetch<{ data: any }>('/students/me').then((r) => r.data),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#72E0E3" />
      </View>
    );
  }

  const displayName = profile?.fullName ?? user?.user_metadata?.full_name ?? 'Student';
  const email = profile?.email ?? user?.email ?? '';
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Info Rows */}
      {profile?.institution && (
        <InfoRow label="Institution" value={profile.institution} />
      )}
      {profile?.department && (
        <InfoRow label="Department" value={profile.department} />
      )}
      {profile?.enrollmentYear && (
        <InfoRow label="Enrollment Year" value={String(profile.enrollmentYear)} />
      )}

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f12' },
  content: { padding: 20, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f12' },
  avatarContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6F4CFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitials: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#E6EEF3' },
  email: { fontSize: 14, color: '#9AA3B2', marginTop: 4 },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: { fontSize: 14, color: '#9AA3B2' },
  infoValue: { fontSize: 14, color: '#E6EEF3', fontWeight: '500' },
  logoutButton: {
    marginTop: 40,
    width: '100%',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
});
