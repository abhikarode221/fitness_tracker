// AdminDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = ['#f59e0b', '#06b6d4', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

/* ── Reusable chart wrapper with per-chart loading state ── */
function ChartCard({ title, loading, error, onRetry, children }) {
  return (
    <div className="ad-chart-card">
      <h3 className="ad-chart-title">{title}</h3>
      <div className="ad-chart-body">
        {loading && (
          <div className="ad-chart-skeleton">
            <div className="ad-skeleton-bar" />
            <div className="ad-skeleton-bar short" />
          </div>
        )}
        {!loading && error && (
          <div className="ad-chart-error">
            <p>{error}</p>
            <button className="ad-retry-btn" onClick={onRetry}>Retry</button>
          </div>
        )}
        {!loading && !error && children}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ad-tooltip">
      <p className="ad-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#f59e0b' }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Individual data fetcher hook ── */
function useChartData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data || json || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

/* ══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  /* 4 separate API calls — one per graph */
  const registrations = useChartData('/dashboard/registrations');
  const departments   = useChartData('/dashboard/departments');
  const ageGroups     = useChartData('/dashboard/age-groups');
  const statusData    = useChartData('/dashboard/status');

  /* Derived summary numbers */
  const totalUsers = departments.data.reduce((s, d) => s + (d.count || 0), 0);
  const activeUsers = statusData.data.find(s => s.status === 'Active')?.count || 0;
  const deptCount = departments.data.length;
  const recentSignups = registrations.data.reduce((s, m) => s + (m.count || 0), 0);

  const stats = [
    { label: 'Total Users', value: totalUsers, accent: '#f59e0b' },
    { label: 'Active Users', value: activeUsers, accent: '#10b981' },
    { label: 'Departments', value: deptCount, accent: '#06b6d4' },
    { label: '12mo Signups', value: recentSignups, accent: '#8b5cf6' },
  ];

  return (
    <div className="ad-page">
      {/* Header */}
      <header className="ad-header">
        <div className="ad-header-text">
          <h1 className="ad-title">Dashboard</h1>
          <p className="ad-subtitle">Real-time analytics across your organization</p>
        </div>
        <button className="ad-primary-btn" onClick={() => navigate('/users')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Manage Users
        </button>
      </header>

      {/* Summary row */}
      <div className="ad-stats-row">
        {stats.map(s => (
          <div key={s.label} className="ad-stat-card">
            <span className="ad-stat-value" style={{ color: s.accent }}>{s.value}</span>
            <span className="ad-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* 4 Graphs — each with independent loading / error / retry */}
      <div className="ad-charts-grid">

        {/* Graph 1 — Registrations over time */}
        <ChartCard title="User Registrations" loading={registrations.loading} error={registrations.error} onRetry={registrations.refetch}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={registrations.data}>
              <defs>
                <linearGradient id="adGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a"/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717a' }}/>
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} allowDecimals={false}/>
              <Tooltip content={<ChartTooltip />}/>
              <Area type="monotone" dataKey="count" name="Signups" stroke="#f59e0b" strokeWidth={2.5} fill="url(#adGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graph 2 — By department */}
        <ChartCard title="Users by Department" loading={departments.loading} error={departments.error} onRetry={departments.refetch}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departments.data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} allowDecimals={false}/>
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#71717a' }} width={95}/>
              <Tooltip content={<ChartTooltip />}/>
              <Bar dataKey="count" name="Users" radius={[0, 6, 6, 0]}>
                {departments.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graph 3 — By age group */}
        <ChartCard title="Age Distribution" loading={ageGroups.loading} error={ageGroups.error} onRetry={ageGroups.refetch}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={ageGroups.data} dataKey="count" nameKey="group"
                cx="50%" cy="50%" outerRadius={95} innerRadius={48} paddingAngle={3}
                label={({ group, percent }) => `${group} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#52525b', strokeWidth: 1 }}>
                {ageGroups.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<ChartTooltip />}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graph 4 — By status */}
        <ChartCard title="Users by Status" loading={statusData.loading} error={statusData.error} onRetry={statusData.refetch}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={statusData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a"/>
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#71717a' }}/>
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} allowDecimals={false}/>
              <Tooltip content={<ChartTooltip />}/>
              <Line type="monotone" dataKey="count" name="Users" stroke="#06b6d4" strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 6, strokeWidth: 2, stroke: '#1a1d27' }}
                activeDot={{ r: 8 }}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
