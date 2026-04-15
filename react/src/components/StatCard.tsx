import type { ReactNode } from 'react';

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="ve-stat-card">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
