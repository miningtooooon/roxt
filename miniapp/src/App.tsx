import React, { useEffect, useMemo, useState } from 'react';
import {
  claimCollect,
  completeTask,
  createWithdraw,
  getMe,
  getReferrals,
  getSettings,
  getTasks,
  getWithdrawals,
  loginDemo,
  startCollect
} from './api';
import { BalancePill, GlowBackground, GlassCard, Input, NeonButton, ParticlesLayer } from './ui';
import { ToastViewport, toast } from './toast';

type TabKey = 'collect' | 'tasks' | 'referrals' | 'withdraw';

export default function App() {
  const [tab, setTab] = useState<TabKey>('collect');
  const [me, setMe] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // Demo login: in real Mini App, call backend with Telegram initData verification.
  useEffect(() => {
    const existing = localStorage.getItem('user_token');
    if (existing) {
      refresh();
      return;
    }

    // generate demo identity
    const tgId = String(100000 + Math.floor(Math.random() * 900000));
    const username = `demo_${tgId}`;
    loginDemo(tgId, username, 'Demo').then(({ token }) => {
      localStorage.setItem('user_token', token);
      refresh();
    });
  }, []);

  async function refresh() {
    const [m, s] = await Promise.all([getMe(), getSettings()]);
    setMe(m);
    setSettings(s);
  }

  if (!me || !settings) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <GlowBackground />
        <ParticlesLayer />
        <div className="relative mx-auto max-w-md px-4 py-10">
          <GlassCard>Loading…</GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <GlowBackground />
      <ParticlesLayer />
      <ToastViewport />

      <div className="relative mx-auto max-w-md px-4 pb-24 pt-4">
        <Header balance={me.balance} onRefresh={refresh} />

        <div className="mt-4 space-y-3">
          {tab === 'collect' && <CollectTab settings={settings} onReward={refresh} />}
          {tab === 'tasks' && <TasksTab onReward={refresh} />}
          {tab === 'referrals' && <ReferralsTab />}
          {tab === 'withdraw' && <WithdrawTab settings={settings} onReward={refresh} balance={me.balance} />}
        </div>
      </div>

      <BottomTabs tab={tab} setTab={setTab} features={settings.features} />
    </div>
  );
}

function Header({ balance, onRefresh }: { balance: number; onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm opacity-80">Rewards</div>
        <div className="text-xl font-semibold tracking-wide">TON Rewards</div>
      </div>
      <div className="flex items-center gap-2">
        <BalancePill value={balance} />
        <button
          onClick={onRefresh}
          className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 shadow-[0_0_20px_rgba(255,255,255,0.08)] active:scale-95 transition"
          aria-label="refresh"
        >
          ↻
        </button>
      </div>
    </div>
  );
}

function CollectTab({ settings, onReward }: { settings: any; onReward: () => void }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // fetch current session if any
    startCollect().then(setSession).catch(() => null);
  }, []);

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">Session</div>
            <div className="text-lg font-semibold">Collect reward</div>
            <div className="mt-1 text-xs opacity-70">Start → wait timer → claim</div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15">
            +{Number(settings.collectReward).toFixed(6)} TON
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <NeonButton
            className="flex-1"
            onClick={async () => {
              const s = await startCollect();
              setSession(s);
              toast('Session started');
            }}
          >
            Start
          </NeonButton>
          <button
            onClick={async () => {
              const res = await claimCollect();
              if (res.ok) {
                toast(`Added +${Number(res.reward).toFixed(6)} TON`);
                onReward();
                const s = await startCollect();
                setSession(s);
              } else {
                toast(res.error || 'Cannot claim');
              }
            }}
            className="flex-1 h-12 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 active:scale-[0.99] transition"
          >
            Claim
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">Status</div>
            <div className="text-base font-semibold">{session?.status || '—'}</div>
          </div>
          <div className="text-xs opacity-70">
            Duration: {settings.collectDurationSec}s
          </div>
        </div>
        {session?.endAt && (
          <div className="mt-2 text-xs opacity-70">Ends at: {new Date(session.endAt).toLocaleString()}</div>
        )}
      </GlassCard>
    </>
  );
}

function TasksTab({ onReward }: { onReward: () => void }) {
  const [tasks, setTasks] = useState<any[]>([]);

  const load = () => getTasks().then(setTasks);
  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <GlassCard>
        <div className="text-lg font-semibold">Tasks</div>
        <div className="text-xs opacity-70 mt-1">Each task is one-time per user. (Demo: click to complete)</div>
      </GlassCard>

      {tasks.map((t) => (
        <GlassCard key={t._id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs opacity-70 mt-1">Reward: {Number(t.rewardAmount).toFixed(6)} TON</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15">
              {t.done ? 'Done' : 'Ready'}
            </span>
          </div>

          <div className="mt-3">
            {t.done ? (
              <button className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed">
                Completed
              </button>
            ) : (
              <NeonButton
                className="w-full"
                onClick={async () => {
                  const res = await completeTask(t._id);
                  if (res.ok) {
                    toast(`Task done +${Number(res.reward).toFixed(6)} TON`);
                    onReward();
                    load();
                  } else {
                    toast(res.error || 'Failed');
                  }
                }}
              >
                Start & Complete
              </NeonButton>
            )}
          </div>
        </GlassCard>
      ))}

      {!tasks.length && <GlassCard>No tasks yet. Add tasks from Admin.</GlassCard>}
    </>
  );
}

function ReferralsTab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getReferrals().then(setData);
  }, []);

  if (!data) return <GlassCard>Loading…</GlassCard>;

  return (
    <>
      <GlassCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Referrals</div>
            <div className="text-xs opacity-70 mt-1">Earn when new users join via your link.</div>
          </div>
          <NeonButton
            onClick={() => {
              navigator.clipboard?.writeText(data.link);
              toast('Referral link copied');
            }}
          >
            Copy
          </NeonButton>
        </div>
        <div className="mt-3 text-xs opacity-70 break-all">{data.link}</div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="text-sm opacity-80">Total earned</div>
          <div className="text-lg font-semibold">{Number(data.totalEarned).toFixed(6)} TON</div>
        </div>
        <div className="mt-3 space-y-2">
          {data.users.map((u: any) => (
            <div key={u._id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="text-sm">@{u.username || u.firstName || 'user'}</div>
              <div className="text-sm font-semibold">{Number(data.referralReward).toFixed(6)} TON</div>
            </div>
          ))}
          {!data.users.length && <div className="text-sm opacity-70">No referrals yet.</div>}
        </div>
      </GlassCard>
    </>
  );
}

function WithdrawTab({ settings, onReward, balance }: { settings: any; onReward: () => void; balance: number }) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const load = () => getWithdrawals().then(setHistory);
  useEffect(() => { load(); }, []);

  return (
    <>
      <GlassCard>
        <div className="text-lg font-semibold">Withdraw</div>
        <div className="text-xs opacity-70 mt-1">Manual review. Minimum: {Number(settings.minWithdraw).toFixed(6)} TON</div>

        <div className="mt-3 space-y-2">
          <Input value={address} onChange={setAddress} placeholder="TON Address" />
          <Input value={amount} onChange={setAmount} placeholder="Amount (e.g. 0.005)" />
          <NeonButton
            className="w-full"
            disabled={!address.trim() || !amount.trim()}
            onClick={async () => {
              const a = Number(amount);
              if (!Number.isFinite(a) || a <= 0) return toast('Invalid amount');
              const res = await createWithdraw(address.trim(), a);
              if (res.ok) {
                toast('Withdraw request submitted');
                setAddress('');
                setAmount('');
                onReward();
                load();
              } else {
                toast(res.error || 'Failed');
              }
            }}
          >
            Create Request
          </NeonButton>
          <div className="text-xs opacity-70">Your balance: {balance.toFixed(6)} TON</div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm opacity-80">History</div>
        <div className="mt-2 space-y-2">
          {history.map((w) => (
            <div key={w._id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="text-sm font-semibold tabular-nums">{Number(w.amount).toFixed(6)} TON</div>
              <div className="text-xs opacity-90">
                {w.status === 'pending' ? '🟡 Under review' : w.status === 'paid' ? '🟢 Paid' : '🔴 Rejected'}
              </div>
            </div>
          ))}
          {!history.length && <div className="text-sm opacity-70">No withdrawals yet.</div>}
        </div>
      </GlassCard>
    </>
  );
}

function BottomTabs({ tab, setTab, features }: { tab: TabKey; setTab: (t: TabKey) => void; features: any }) {
  const items: { k: TabKey; label: string; enabled: boolean }[] = [
    { k: 'collect', label: 'Collect', enabled: !!features?.collect },
    { k: 'tasks', label: 'Tasks', enabled: !!features?.tasks },
    { k: 'referrals', label: 'Referrals', enabled: !!features?.referrals },
    { k: 'withdraw', label: 'Withdraw', enabled: !!features?.withdraw }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="rounded-[28px] bg-black/30 border border-white/10 backdrop-blur-xl p-2 flex gap-2">
          {items.map((it) => (
            <button
              key={it.k}
              disabled={!it.enabled}
              onClick={() => it.enabled && setTab(it.k)}
              className={[
                'flex-1 h-14 rounded-3xl transition border',
                tab === it.k
                  ? 'bg-white/12 border-white/20 shadow-[0_0_26px_rgba(255,255,255,0.10)]'
                  : 'bg-white/6 border-white/10 hover:bg-white/10',
                !it.enabled ? 'opacity-40 cursor-not-allowed' : ''
              ].join(' ')}
            >
              <div className="text-xs opacity-90">{it.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
