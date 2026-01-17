const API = import.meta.env.VITE_API_URL as string;

export function getToken() {
  return localStorage.getItem('user_token') || '';
}

export async function loginDemo(tgId: string, username: string, firstName: string, referrerTgId?: string) {
  const res = await fetch(`${API}/api/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tgId, username, firstName, referrerTgId })
  });
  if (!res.ok) throw new Error('Auth failed');
  return res.json() as Promise<{ token: string }>;
}

async function authed(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  return res;
}

export async function getMe() {
  const res = await authed('/api/me');
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function getSettings() {
  const res = await authed('/api/settings');
  return res.json();
}

export async function startCollect() {
  const res = await authed('/api/collect/start', { method: 'POST' });
  return res.json();
}

export async function claimCollect() {
  const res = await authed('/api/collect/claim', { method: 'POST' });
  return res.json();
}

export async function getTasks() {
  const res = await authed('/api/tasks');
  return res.json();
}

export async function completeTask(taskId: string) {
  const res = await authed('/api/tasks/complete', { method: 'POST', body: JSON.stringify({ taskId }) });
  return res.json();
}

export async function getReferrals() {
  const res = await authed('/api/referrals');
  return res.json();
}

export async function createWithdraw(address: string, amount: number) {
  const res = await authed('/api/withdraw', { method: 'POST', body: JSON.stringify({ address, amount }) });
  return res.json();
}

export async function getWithdrawals() {
  const res = await authed('/api/withdrawals');
  return res.json();
}
