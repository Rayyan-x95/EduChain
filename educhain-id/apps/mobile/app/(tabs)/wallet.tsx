import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Share } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth';

interface WalletCredential {
  id: string;
  title: string;
  credentialType: string;
  status: string;
  issuedDate: string;
  signature?: string | null;
  credentialHash?: string | null;
  institution?: { name: string };
}

export default function WalletScreen() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['wallet', 'credentials'],
    queryFn: () =>
      apiFetch<{ data: { credentials: WalletCredential[] } }>('/credentials/me').then(
        (r) => r.data.credentials,
      ),
    enabled: !!user,
  });

  const handleShare = async (cred: WalletCredential) => {
    const verifyUrl = `https://educhain.id/verify/${cred.id}`;
    await Share.share({
      title: `EduChain Credential: ${cred.title}`,
      message: `Verify my credential "${cred.title}" at ${verifyUrl}`,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#72E0E3" />
      </View>
    );
  }

  const signed = data?.filter((c) => c.signature) ?? [];
  const unsigned = data?.filter((c) => !c.signature) ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={[...(signed.length ? [{ type: 'header', title: 'Verified Credentials' }] : []),
        ...signed.map((c) => ({ type: 'credential' as const, ...c })),
        ...(unsigned.length ? [{ type: 'header', title: 'Pending Verification' }] : []),
        ...unsigned.map((c) => ({ type: 'credential' as const, ...c })),
      ]}
      keyExtractor={(item, idx) => ('id' in item ? item.id : `h-${idx}`)}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <Text style={styles.sectionTitle}>{item.title}</Text>
          );
        }

        const cred = item as WalletCredential & { type: 'credential' };

        return (
          <View style={[styles.card, cred.signature ? styles.verifiedCard : null]}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{cred.title}</Text>
                <Text style={styles.cardMeta}>{cred.credentialType}</Text>
                {cred.institution?.name && (
                  <Text style={styles.cardMeta}>{cred.institution.name}</Text>
                )}
                <Text style={styles.cardDate}>
                  Issued {new Date(cred.issuedDate).toLocaleDateString()}
                </Text>
              </View>

              {cred.signature && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Signed</Text>
                </View>
              )}
            </View>

            {cred.signature && (
              <Pressable style={styles.shareButton} onPress={() => handleShare(cred)}>
                <Text style={styles.shareText}>Share Credential</Text>
              </Pressable>
            )}

            {cred.credentialHash && (
              <Text style={styles.hashText} numberOfLines={1}>
                Hash: {cred.credentialHash.slice(0, 16)}...
              </Text>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Your Wallet is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Verified credentials will appear here as digital identity cards.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f12' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0f12',
    padding: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#E6EEF3', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9AA3B2', textAlign: 'center' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9AA3B2',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  verifiedCard: {
    borderColor: 'rgba(52,211,153,0.25)',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#E6EEF3', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: '#9AA3B2', marginBottom: 2 },
  cardDate: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  verifiedBadge: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#34D399' },
  shareButton: {
    marginTop: 12,
    backgroundColor: 'rgba(114,224,227,0.12)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareText: { fontSize: 14, fontWeight: '500', color: '#72E0E3' },
  hashText: { fontSize: 10, color: '#6B7280', fontFamily: 'monospace', marginTop: 8 },
});
