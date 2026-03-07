'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Modal } from './Shared';
import { Avatar } from '../atoms/Avatar';
import { Textarea } from '../atoms/Textarea';
import { Button } from '../atoms/Button';

interface CollaborationModalProps {
  open: boolean;
  onClose: () => void;
  targetStudent: {
    name: string;
    institution: string;
    avatar?: string | null;
  };
  onSend?: (message: string) => void;
}

export function CollaborationModal({ open, onClose, targetStudent, onSend }: CollaborationModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      onSend?.(message);
    } finally {
      setSending(false);
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request Collaboration"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSend} loading={sending} disabled={!message.trim()}>
            Send Request
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={targetStudent.avatar} alt={targetStudent.name} size="md" />
        <div>
          <p className="text-body-medium text-[var(--text-primary)]">{targetStudent.name}</p>
          <p className="text-caption text-[var(--text-secondary)]">{targetStudent.institution}</p>
        </div>
      </div>
      <Textarea
        label="Message"
        placeholder="Tell them about the project or collaboration idea..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />
    </Modal>
  );
}
