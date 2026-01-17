import React, { useEffect, useState } from 'react';
import { getSettings, patchSettings } from '../../api';
import { GlassCard, Input, NeonButton } from '../../ui';

export default function Settings({ mode }: { mode?: 'ads' }) {
  const [s, setS] = useState<any>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getSettings().then(setS);
  }, []);

  if (!s) return <GlassCard>Loading…</GlassCard>;

  const save = async () => {
    setMsg('');
    try {
      const updated = await patchSettings(s);
      setS(updated);
      setMsg('Saved');
    } catch {
      setMsg('Failed');
    }
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="text-lg font-semibold">{mode === 'ads' ? 'Ads Codes' : 'Settings'}</div>
        <div className="text-xs opacity-70 mt-1">Everything here is dynamic (stored in DB).</div>
      </GlassCard>

      {mode === 'ads' ? (
        <GlassCard>
          <div className="text-sm opacity-80">Adsgram Code</div>
          <textarea
            className="mt-2 w-full min-h-[120px] rounded-2xl bg-white/10 border border-white/15 p-3 outline-none placeholder:text-white/40 focus:border-white/30 focus:bg-white/15 transition"
            value={s.adsgramCode || ''}
            onChange={(e) => setS({ ...s, adsgramCode: e.target.value })}
          />

          <div className="mt-4 text-sm opacity-80">Monetag Code</div>
          <textarea
            className="mt-2 w-full min-h-[120px] rounded-2xl bg-white/10 border border-white/15 p-3 outline-none placeholder:text-white/40 focus:border-white/30 focus:bg-white/15 transition"
            value={s.monetagCode || ''}
            onChange={(e) => setS({ ...s, monetagCode: e.target.value })}
          />

          <div className="mt-4 flex items-center gap-2">
            <NeonButton onClick={save}>Save</NeonButton>
            {msg && <span className="text-sm opacity-80">{msg}</span>}
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Collect Duration (sec)" value={String(s.collectDurationSec)} onChange={(v) => setS({ ...s, collectDurationSec: Number(v) })} />
            <Field label="Collect Reward" value={String(s.collectReward)} onChange={(v) => setS({ ...s, collectReward: Number(v) })} />
            <Field label="Referral Reward" value={String(s.referralReward)} onChange={(v) => setS({ ...s, referralReward: Number(v) })} />
            <Field label="Min Withdraw" value={String(s.minWithdraw)} onChange={(v) => setS({ ...s, minWithdraw: Number(v) })} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Toggle label="Collect" checked={!!s.features?.collect} onChange={(b) => setS({ ...s, features: { ...s.features, collect: b } })} />
            <Toggle label="Tasks" checked={!!s.features?.tasks} onChange={(b) => setS({ ...s, features: { ...s.features, tasks: b } })} />
            <Toggle label="Referrals" checked={!!s.features?.referrals} onChange={(b) => setS({ ...s, features: { ...s.features, referrals: b } })} />
            <Toggle label="Withdraw" checked={!!s.features?.withdraw} onChange={(b) => setS({ ...s, features: { ...s.features, withdraw: b } })} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <NeonButton onClick={save}>Save</NeonButton>
            {msg && <span className="text-sm opacity-80">{msg}</span>}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-1">
        <Input value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      className="h-12 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition flex items-center justify-between px-4"
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className="text-sm">{label}</span>
      <span className="text-xs opacity-80">{checked ? 'Enabled' : 'Disabled'}</span>
    </button>
  );
}
