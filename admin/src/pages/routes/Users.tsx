import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api';
import { GlassCard, Input } from '../../ui';

export default function Users() {
  const [q, setQ] = useState('');
  const [list, setList] = useState<any[]>([]);

  const load = () => getUsers(q || undefined).then(setList);

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Users</div>
            <div className="text-xs opacity-70 mt-1">Search by tgId / username / name</div>
          </div>
          <div className="flex gap-2">
            <div className="w-64">
              <Input value={q} onChange={setQ} placeholder="Search" />
            </div>
            <button
              className="h-12 px-4 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              onClick={load}
            >
              Search
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs opacity-70">
              <tr>
                <th className="text-left py-2">tgId</th>
                <th className="text-left py-2">username</th>
                <th className="text-left py-2">balance</th>
                <th className="text-left py-2">referrals</th>
                <th className="text-left py-2">created</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id} className="border-t border-white/10">
                  <td className="py-2 tabular-nums">{u.tgId}</td>
                  <td className="py-2">@{u.username || ''}</td>
                  <td className="py-2 tabular-nums">{u.balance.toFixed(6)}</td>
                  <td className="py-2 tabular-nums">{u.referralsCount}</td>
                  <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <div className="text-sm opacity-70 mt-2">No users.</div>}
        </div>
      </GlassCard>
    </div>
  );
}
