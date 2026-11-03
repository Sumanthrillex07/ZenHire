import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  ApplicationStatusBadge, 
  CategoryBadge, 
  JobStatusBadge, 
  MatchScoreBadge 
} from '../components/Badge';

describe('Badge Components', () => {
  it('renders application statuses correctly', () => {
    const { rerender } = render(<ApplicationStatusBadge status="APPLIED" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();

    rerender(<ApplicationStatusBadge status="SHORTLISTED" />);
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();

    rerender(<ApplicationStatusBadge status="HIRED" />);
    expect(screen.getByText('Hired')).toBeInTheDocument();

    rerender(<ApplicationStatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders role category badges correctly', () => {
    const { rerender } = render(<CategoryBadge category="FRONTEND" />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();

    rerender(<CategoryBadge category="BACKEND" />);
    expect(screen.getByText('Backend')).toBeInTheDocument();

    rerender(<CategoryBadge category="AI_ML" />);
    expect(screen.getByText('AI / ML')).toBeInTheDocument();
  });

  it('renders job status open vs closed', () => {
    const { rerender } = render(<JobStatusBadge status="OPEN" />);
    expect(screen.getByText('Open')).toBeInTheDocument();

    rerender(<JobStatusBadge status="CLOSED" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders match score percentage badge', () => {
    render(<MatchScoreBadge score={85} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Match')).toBeInTheDocument();
  });
});
