'use client';

import React, { useState } from 'react';
import { CollaborationRequestCard } from '@/components/molecules/CollaborationRequestCard';
import { StudentCard } from '@/components/molecules/StudentCard';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/organisms/Shared';
import { Users, UserPlus, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useCollaborationRequests, useActiveCollaborators } from '@/hooks/api';

type Tab = 'incoming' | 'outgoing' | 'active';

export default function CollaborationsPage() {
  const [tab, setTab] = useState<Tab>('incoming');
  const { data: incoming, isLoading: inLoading } = useCollaborationRequests('incoming');
  const { data: outgoing, isLoading: outLoading } = useCollaborationRequests('outgoing');
  const { data: active, isLoading: activeLoading } = useActiveCollaborators();

  const incomingList = incoming ?? [];
  const outgoingList = outgoing ?? [];
  const activeList = active ?? [];

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'incoming', label: 'Incoming', count: incomingList.length, icon: <UserPlus className="h-4 w-4" /> },
    { key: 'outgoing', label: 'Outgoing', count: outgoingList.length, icon: <Clock className="h-4 w-4" /> },
    { key: 'active', label: 'Active', count: activeList.length, icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const isLoading = (tab === 'incoming' && inLoading) || (tab === 'outgoing' && outLoading) || (tab === 'active' && activeLoading);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">Collaborations</h1>
        <p className="text-body text-[var(--text-secondary)]">Manage your collaboration requests and active partnerships</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--bg-surface)] rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-body-medium transition-colors ${
              tab === t.key
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && <Badge variant="info">{t.count}</Badge>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
      ) : (
        <>
          {/* Content */}
          {tab === 'incoming' && (
            <div className="space-y-3">
              {incomingList.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-12 w-12" />}
                  title="No incoming requests"
                  description="When someone sends you a collaboration request, it will show up here."
                />
              ) : (
                incomingList.map((req: any) => (
                  <CollaborationRequestCard
                    key={req.id}
                    name={req.senderName ?? ''}
                    institution={req.senderInstitution ?? ''}
                    avatar={null}
                    message={req.message ?? ''}
                    verified={true}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'outgoing' && (
            <div className="space-y-3">
              {outgoingList.length === 0 ? (
                <EmptyState
                  icon={<Clock className="h-12 w-12" />}
                  title="No outgoing requests"
                  description="Collaboration requests you send will appear here."
                />
              ) : (
                outgoingList.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-medium text-[var(--text-primary)]">{req.receiverName ?? ''}</p>
                        <p className="text-caption text-[var(--text-secondary)]">{req.receiverInstitution ?? ''}</p>
                      </div>
                      <Badge variant="pending">Pending</Badge>
                    </div>
                    {req.message && (
                      <p className="text-body text-[var(--text-secondary)] mt-2 line-clamp-2">&ldquo;{req.message}&rdquo;</p>
                    )}
                    <Button variant="ghost" size="sm" className="mt-3">Cancel Request</Button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'active' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeList.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-12 w-12" />}
                  title="No active collaborations"
                  description="Accept collaboration requests to start working together."
                />
              ) : (
                activeList.map((s: any) => (
                  <StudentCard
                    key={s.id}
                    name={s.name}
                    institution={s.institution ?? ''}
                    skills={s.skills ?? []}
                    verified={s.verified ?? false}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
