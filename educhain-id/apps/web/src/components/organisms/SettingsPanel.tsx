'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toggle } from '../atoms/Toggle';
import { Divider } from '../atoms/Divider';
import { Button } from '../atoms/Button';
import { ChevronDown } from 'lucide-react';

interface ToggleItem {
  key: string;
  type: 'toggle';
  label: string;
  description?: string;
  defaultValue?: boolean;
}

interface SelectItem {
  key: string;
  type: 'select';
  label: string;
  description?: string;
  options: string[];
  defaultValue?: string;
}

interface ActionItem {
  key: string;
  type: 'action';
  label: string;
  description?: string;
  buttonLabel?: string;
  variant?: 'primary' | 'danger' | 'outline';
}

type SettingsItem = ToggleItem | SelectItem | ActionItem;

interface SettingsSection {
  title: string;
  description?: string;
  items: SettingsItem[];
}

interface SettingsPanelProps {
  sections: SettingsSection[];
  onChange?: (key: string, value: unknown) => void;
  className?: string;
}

export function SettingsPanel({ sections, onChange, className }: SettingsPanelProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    sections.forEach((s) =>
      s.items.forEach((item) => {
        if (item.type === 'toggle') initial[item.key] = item.defaultValue ?? false;
        if (item.type === 'select') initial[item.key] = item.defaultValue ?? '';
      }),
    );
    return initial;
  });

  const update = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    onChange?.(key, value);
  };

  return (
    <div className={cn('space-y-8', className)}>
      {sections.map((section, si) => (
        <section key={si} className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <h3 className="text-h4 text-[var(--text-primary)]">{section.title}</h3>
          {section.description && (
            <p className="text-body text-[var(--text-secondary)] mt-1">{section.description}</p>
          )}
          <div className="mt-4 space-y-1">
            {section.items.map((item, ii) => (
              <div key={item.key}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-body-medium text-[var(--text-primary)]">{item.label}</p>
                    {item.description && (
                      <p className="text-caption text-[var(--text-tertiary)] mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {item.type === 'toggle' && (
                    <Toggle
                      checked={values[item.key] as boolean}
                      onChange={(v) => update(item.key, v)}
                    />
                  )}
                  {item.type === 'select' && (
                    <div className="relative w-40">
                      <select
                        value={values[item.key] as string}
                        onChange={(e) => update(item.key, e.target.value)}
                        className="w-full h-9 pl-3 pr-8 text-caption appearance-none rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        {item.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
                    </div>
                  )}
                  {item.type === 'action' && (
                    <Button variant={item.variant ?? 'outline'} size="sm" onClick={() => onChange?.(item.key, 'action')}>
                      {item.buttonLabel ?? 'Manage'}
                    </Button>
                  )}
                </div>
                {ii < section.items.length - 1 && <Divider variant="subtle" />}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
