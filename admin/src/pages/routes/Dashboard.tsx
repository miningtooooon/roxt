import React, { useEffect, useState } from 'react';
import { getStats } from '../../api';
import { GlassCard } from '../../ui';

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <GlassCard className="p-5">
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </GlassCard>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="text-lg font-semibold">Overview</div>
        <div className="text-xs opacity-70 mt-1">Live stats from MongoDB</div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat label="Total Users" value={stats?.totalUsers ?? '—'} />
        <Stat label="Active (24h)" value={stats?.active24h ?? '—'} />
        <Stat label="Pending Withdrawals" value={stats?.pendingWithdrawals ?? '—'} />
        <Stat label="Total Withdrawals" value={stats?.totalWithdrawals ?? '—'} />
        <Stat label="Task Completions" value={stats?.totalTaskCompletions ?? '—'} />
      </div>
    </div>
  );
}
