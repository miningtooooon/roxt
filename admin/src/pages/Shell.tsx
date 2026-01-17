import React from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { GlowBackground } from '../ui';
import Dashboard from './routes/Dashboard';
import Settings from './routes/Settings';
import Tasks from './routes/Tasks';
import Withdrawals from './routes/Withdrawals';
import Users from './routes/Users';

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'block px-4 py-3 rounded-2xl border transition',
          isActive
            ? 'bg-white/12 border-white/20 shadow-[0_0_26px_rgba(255,255,255,0.10)]'
            : 'bg-white/6 border-white/10 hover:bg-white/10'
        ].join(' ')
      }
      end
    >
      <div className="text-sm font-semibold">{label}</div>
    </NavLink>
  );
}

export default function Shell() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <GlowBackground />

      <div className="relative mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">TON Rewards</div>
            <div className="text-2xl font-semibold">Admin Panel</div>
          </div>
          <button
            className="h-11 px-4 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
            onClick={() => {
              localStorage.removeItem('admin_token');
              nav('/login');
            }}
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          <div className="space-y-2">
            <Item to="/" label="Dashboard" />
            <Item to="/settings" label="Settings" />
            <Item to="/ads" label="Ads Codes" />
            <Item to="/tasks" label="Tasks" />
            <Item to="/withdrawals" label="Withdrawals" />
            <Item to="/users" label="Users" />
          </div>

          <div className="min-h-[60vh]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ads" element={<Settings mode="ads" />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/withdrawals" element={<Withdrawals />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </div>
        </div>

        <div className="mt-6 text-xs opacity-60">
          Backend API should be running and CORS allowed.
        </div>
      </div>
    </div>
  );
}
