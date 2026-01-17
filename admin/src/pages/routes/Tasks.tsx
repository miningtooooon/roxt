import React, { useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, patchTask } from '../../api';
import { GlassCard, Input, NeonButton } from '../../ui';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ type: 'adsgram', title: '', rewardAmount: 0.001, active: true, sortOrder: 0 });

  const load = () => getTasks().then(setTasks);
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="text-lg font-semibold">Tasks</div>
        <div className="text-xs opacity-70 mt-1">Add / edit / delete tasks. One-time per user enforced by backend.</div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold">Create Task</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Field label="Reward" value={String(form.rewardAmount)} onChange={(v) => setForm({ ...form, rewardAmount: Number(v) })} />
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Sort" value={String(form.sortOrder)} onChange={(v) => setForm({ ...form, sortOrder: Number(v) })} />
        </div>
        <div className="mt-3 flex gap-2">
          <NeonButton
            onClick={async () => {
              if (!form.title.trim()) return;
              await createTask(form);
              setForm({ type: 'adsgram', title: '', rewardAmount: 0.001, active: true, sortOrder: 0 });
              await load();
            }}
          >
            Add
          </NeonButton>
          <button
            className="h-12 px-4 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
            onClick={load}
          >
            Refresh
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold">All Tasks</div>
        <div className="mt-3 space-y-2">
          {tasks.map((t) => (
            <div key={t._id} className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs opacity-70">{t.type} • reward {t.rewardAmount} • sort {t.sortOrder}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="h-10 px-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
                    onClick={async () => {
                      await patchTask(t._id, { active: !t.active });
                      await load();
                    }}
                  >
                    {t.active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    className="h-10 px-3 rounded-2xl bg-red-500/20 border border-red-200/20 hover:bg-red-500/25 transition"
                    onClick={async () => {
                      await deleteTask(t._id);
                      await load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!tasks.length && <div className="text-sm opacity-70">No tasks yet.</div>}
        </div>
      </GlassCard>
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

function Select({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs opacity-70">{label}</div>
      <select
        className="mt-1 w-full h-12 rounded-2xl bg-white/10 border border-white/15 px-4 outline-none focus:border-white/30 focus:bg-white/15 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="adsgram">adsgram</option>
        <option value="monetag">monetag</option>
        <option value="external">external</option>
        <option value="join_channel">join_channel</option>
        <option value="start_bot">start_bot</option>
      </select>
    </div>
  );
}
