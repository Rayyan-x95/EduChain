import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';

interface ActivityItem {
  id: string;
  avatar?: string | null;
  name: string;
  event: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
  className?: string;
}

export function ActivityFeed({ activities, onViewAll, className }: ActivityFeedProps) {
  const visible = activities.slice(0, 5);

  return (
    <section className={className}>
      <h3 className="text-h4 text-[var(--text-primary)] mb-4">Recent Activity</h3>

      {visible.length === 0 ? (
        <p className="text-body text-[var(--text-secondary)] py-8 text-center">No recent activity.</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
          {visible.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar src={item.avatar} alt={item.name} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-body text-[var(--text-primary)]">
                  <span className="font-medium">{item.name}</span> {item.event}
                </p>
                <span className="text-caption text-[var(--text-tertiary)]">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 5 && onViewAll && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={onViewAll}>View All</Button>
        </div>
      )}
    </section>
  );
}
