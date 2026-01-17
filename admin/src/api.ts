const API = import.meta.env.VITE_API_URL as string;

export function getToken() {
  return localStorage.getItem('admin_token') || '';
}

export async function adminLogin(code: string) {
  const res = await fetch(`${API}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Wrong code');
  return res.json() as Promise<{ token: string }>;
}

async function authedFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  return res;
}

export async function getStats() {
  const res = await authedFetch('/admin/stats');
  return res.json();
}

export async function getSettings() {
  const res = await authedFetch('/admin/settings');
  return res.json();
}

export async function patchSettings(body: any) {
  const res = await authedFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify(body) });
  return res.json();
}

export async function getTasks() {
  const res = await authedFetch('/admin/tasks');
  return res.json();
}

export async function createTask(body: any) {
  const res = await authedFetch('/admin/tasks', { method: 'POST', body: JSON.stringify(body) });
  return res.json();
}

export async function patchTask(id: string, body: any) {
  const res = await authedFetch(`/admin/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  return res.json();
}

export async function deleteTask(id: string) {
  const res = await authedFetch(`/admin/tasks/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function getWithdrawals(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await authedFetch(`/admin/withdrawals${qs}`);
  return res.json();
}

export async function patchWithdrawal(id: string, body: any) {
  const res = await authedFetch(`/admin/withdrawals/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  return res.json();
}

export async function getUsers(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const res = await authedFetch(`/admin/stats/users${qs}`);
  return res.json();
}
