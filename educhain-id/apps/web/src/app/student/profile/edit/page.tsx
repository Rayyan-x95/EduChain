'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { Avatar } from '@/components/atoms/Avatar';
import { Alert } from '@/components/atoms/Alert';
import { Camera, Plus, Save, Loader2 } from 'lucide-react';
import { useStudentProfile, useUpdateStudentProfile, useMySkills } from '@/hooks/api';

export default function EditProfilePage() {
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: skills } = useMySkills();
  const updateProfile = useUpdateStudentProfile();

  const [form, setForm] = useState({
    name: '',
    bio: '',
    institution: '',
    degree: '',
    graduationYear: '',
    email: '',
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.fullName ?? '',
        bio: profile.bio ?? '',
        institution: profile.institution?.name ?? '',
        degree: profile.degree ?? '',
        graduationYear: profile.graduationYear?.toString() ?? '',
        email: profile.email ?? '',
        skills: skills?.map((s: { skill?: { name: string }; name?: string }) => s.skill?.name ?? s.name ?? '') ?? [],
      });
    }
  }, [profile, skills]);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    setSaved(false);
    updateProfile.mutate(
      {
        fullName: form.name,
        bio: form.bio,
        degree: form.degree,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear, 10) : undefined,
      },
      {
        onSuccess: () => setSaved(true),
      },
    );
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">Edit Profile</h1>
        <p className="text-body text-[var(--text-secondary)]">Update your public profile information</p>
      </div>

      {saved && <Alert variant="success">Profile saved successfully!</Alert>}
      {updateProfile.isError && (
        <Alert variant="error">
          {(updateProfile.error as Error)?.message ?? 'Failed to save profile'}
        </Alert>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={null} alt={form.name} size="xl" />
          <button
            className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white h-8 w-8 rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            aria-label="Change avatar"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <p className="text-body-medium text-[var(--text-primary)]">{form.name}</p>
          <p className="text-caption text-[var(--text-secondary)]">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Personal info */}
      <div className="space-y-4">
        <h3 className="text-h4 text-[var(--text-primary)]">Personal Information</h3>
        <Input label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Textarea label="Bio" value={form.bio} onChange={(e) => update('bio', e.target.value)} maxLength={200} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} disabled />
      </div>

      {/* Academic info */}
      <div className="space-y-4">
        <h3 className="text-h4 text-[var(--text-primary)]">Academic Information</h3>
        <Input label="Institution" value={form.institution} disabled />
        <Input label="Degree" value={form.degree} onChange={(e) => update('degree', e.target.value)} />
        <Select
          label="Graduation Year"
          value={form.graduationYear}
          onChange={(e) => update('graduationYear', e.target.value)}
          options={['2023', '2024', '2025', '2026', '2027', '2028']}
        />
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h3 className="text-h4 text-[var(--text-primary)]">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {form.skills.map((skill) => (
            <Chip key={skill} removable onRemove={() => removeSkill(skill)}>
              {skill}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            className="flex-1"
          />
          <Button variant="outline" size="md" onClick={addSkill} disabled={!newSkill.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
        <Button variant="primary" size="lg" onClick={handleSave} loading={updateProfile.isPending}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
        <Button variant="ghost" size="lg" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
