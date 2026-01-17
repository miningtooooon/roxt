import React, { useEffect, useState } from 'react';
import { getWithdrawals, patchWithdrawal } from '../../api';
import { GlassCard, NeonButton } from '../../ui';

export default function Withdrawals() {
  const [status, setStatus] = useState<string>('');
  const [list, setList] = useState<any[]>([]);

  const load = () => getWithdrawals(status || undefined).then(setList);
  useEffect(() => { load(); }, [status]);

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Withdrawals</div>
            <div className="text-xs opacity-70 mt-1">Change status (pending/paid/rejected).</div>
          </div>
          <select
            className="h-12 rounded-2xl bg-white/10 border border-white/15 px-4 outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="space-y-2">
          {list.map((w) => (
            <div key={w._id} className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold tabular-nums">{w.amount} TON</div>
                  <div className="text-xs opacity-70">{w.address}</div>
                  <div className="text-xs opacity-70 mt-1">User: @{w.userId?.username || ''} ({w.userId?.tgId || ''})</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip status={w.status} />
                  <button
                    className="h-10 px-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
                    onClick={async () => {
                      await patchWithdrawal(w._id, { status: 'paid' });
                      await load();
                    }}
                  >
                    Mark Paid
                  </button>
                  <button
                    className="h-10 px-3 rounded-2xl bg-yellow-500/15 border border-yellow-200/20 hover:bg-yellow-500/20 transition"
                    onClick={async () => {
                      await patchWithdrawal(w._id, { status: 'pending' });
                      await load();
                    }}
                  >
                    Pending
                  </button>
                  <button
                    className="h-10 px-3 rounded-2xl bg-red-500/20 border border-red-200/20 hover:bg-red-500/25 transition"
                    onClick={async () => {
                      await patchWithdrawal(w._id, { status: 'rejected', adminNote: 'Rejected by admin' });
                      await load();
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!list.length && <div className="text-sm opacity-70">No withdrawals.</div>}
        </div>
      </GlassCard>
    </div>
  );
}

function Chip({ status }: { status: 'pending'|'paid'|'rejected' }) {
  const text = status === 'pending' ? '🟡 Pending' : status === 'paid' ? '🟢 Paid' : '🔴 Rejected';
  return (
    <span className="h-10 px-3 inline-flex items-center rounded-2xl bg-white/10 border border-white/15 text-sm">
      {text}
    </span>
  );
}
