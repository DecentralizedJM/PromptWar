import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionEngine } from '../components/ActionEngine';
import type { Action, StructuredCard } from '../lib/types';

// Mock the file-saver to avoid actual downloads in testing
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

const mockActions: Action[] = [
  {
    type: 'ADD_CALENDAR',
    label: 'Add to Calendar',
    payload: { title: 'Test Event', date: '2026-10-01', time: '14:00' }
  },
  {
    type: 'DRAFT_EMAIL',
    label: 'Send Doctor Email',
    payload: { to: 'doc@example.com', subject: 'Checkup', body: 'Hello' }
  }
];

const mockCard: StructuredCard = {
  id: 'card-1',
  domain: 'HEALTH',
  title: 'Test Card',
  summary: 'A test summary',
  confidenceScore: 100,
  items: [],
  actions: mockActions
};

describe('ActionEngine', () => {
  it('renders correctly with given actions', () => {
    // Suppress console.error for missing window.navigator features in jsdom that React might complain about
    render(<ActionEngine card={mockCard} />);
    
    // Check if the buttons render correctly
    expect(screen.getByText('Add to Calendar')).not.toBeNull();
    expect(screen.getByText('Send Doctor Email')).not.toBeNull();
  });
});
