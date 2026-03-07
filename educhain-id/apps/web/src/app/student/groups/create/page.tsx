'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateGroup } from '@/hooks/api';

export default function CreateGroupPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const createGroup = useCreateGroup();
  const router = useRouter();

  const addTag = () => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTag('');
    }
  };

  const handleCreate = () => {
    createGroup.mutate(
      { name: name.trim(), description: description.trim() || undefined, visibility, tags },
      { onSuccess: () => router.push('/student/search') },
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/student/search">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </Link>

      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">Create Group</h1>
        <p className="text-body text-[var(--text-secondary)]">Start a new collaboration group and invite students</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Group Name"
          placeholder="e.g. ML Research Team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="What's this group about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />
        <Select
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          options={['Public', 'Verified Only', 'Invite Only']}
        />

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-body-medium text-[var(--text-primary)]">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Chip key={t} removable onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}>
                {t}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="flex-1"
            />
            <Button variant="outline" size="md" onClick={addTag} disabled={!tag.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={handleCreate} loading={createGroup.isPending} disabled={!name.trim()}>
        <Users className="h-4 w-4 mr-2" /> Create Group
      </Button>
    </div>
  );
}
