import React, { useState } from 'react';
import { adminLogin } from '../api';
import { GlowBackground, GlassCard, Input, NeonButton } from '../ui';

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <GlowBackground />

      <div className="relative mx-auto max-w-md px-4 pt-20">
        <GlassCard>
          <div className="text-sm opacity-80">Admin Dashboard</div>
          <div className="text-2xl font-semibold mt-1">Enter Secret Code</div>

          <div className="mt-4">
            <Input value={code} onChange={setCode} placeholder="••••••" />
          </div>

          {err && <div className="text-sm mt-2 text-red-200/90">{err}</div>}

          <NeonButton
            className="mt-4 w-full"
            onClick={async () => {
              setErr('');
              try {
                const { token } = await adminLogin(code);
                localStorage.setItem('admin_token', token);
                onAuthed();
              } catch {
                setErr('Wrong code');
              }
            }}
          >
            Login
          </NeonButton>

          <div className="mt-3 text-xs opacity-70">
            Tip: استخدم كود قوي وطويل + لا تشارك الرابط علنًا.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
