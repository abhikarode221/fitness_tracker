

// UserList.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import EditUserPopup from './EditUserPopup';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const DEPARTMENTS = ['Engineering','Marketing','Sales','HR','Finance','Operations','Design','Support','Legal','Product'];
const ROLES = ['Admin','Manager','Developer','Designer','Analyst','Executive','Intern','Senior Developer','Lead','Coordinator'];
const STATUSES = ['Active','Inactive','Suspended'];

export default function UserList() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: '', ageMin: '', ageMax: '', department: '', role: '', status: '' });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  /* Popup state */
  const [popupUser, setPopupUser] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  /* ── Single BE call: fetch ALL users once ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setAllUsers(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Client-side filtering ── */
  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      const full = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (filters.name && !full.includes(filters.name.toLowerCase())) return false;
      if (filters.ageMin !== '' && u.age < +filters.ageMin) return false;
      if (filters.ageMax !== '' && u.age > +filters.ageMax) return false;
      if (filters.department && u.department !== filters.department) return false;
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;
      return true;
    });
  }, [allUsers, filters]);

  /* Reset page on filter / pageSize change */
  useEffect(() => { setPage(1); }, [filters, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const onFilter = useCallback((patch) => setFilters(p => ({ ...p, ...patch })), []);
  const clearFilters = useCallback(() => setFilters({ name: '', ageMin: '', ageMax: '', department: '', role: '', status: '' }), []);

  /* Edit handlers */
  const openEdit = (user) => { setPopupUser(user); setPopupOpen(true); };
  const closeEdit = () => { setPopupOpen(false); setPopupUser(null); };
  const handleUpdate = async (id, updates) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Update failed (${res.status})`);
    }
    const json = await res.json();
    const updated = json.data;
    /* Optimistic local update */
    setAllUsers(prev => prev.map(u => u._id === id ? { ...u, ...updated } : u));
    return updated;
  };

  /* ── Render ── */
  return (
    <div className="ul-page">
      <header className="ul-header">
        <div className="ul-header-left">
          <h1 className="ul-title">Users</h1>
          <p className="ul-subtitle">
            {filtered.length} of {allUsers.length} users
            {activeCount > 0 && <span className="ul-filter-badge">{activeCount} active filter{activeCount > 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="ul-page-size">
          <span>Show</span>
          <select value={pageSize} onChange={e => setPageSize(+e.target.value)} className="ul-select">
            <option value={10}>10</option>
            <option value={30}>30</option>
          </select>
          <span>per page</span>
        </div>
      </header>

      {error && (
        <div className="ul-alert ul-alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="ul-filter-bar">
        <div className="ul-filter-row">
          <div className="ul-filter-group">
            <label>Name</label>
            <input type="text" className="ul-filter-input" placeholder="Search..." value={filters.name} onChange={e => onFilter({ name: e.target.value })}/>
          </div>
          <div className="ul-filter-group ul-narrow">
            <label>Age min</label>
            <input type="number" className="ul-filter-input" placeholder="18" min="18" max="100" value={filters.ageMin} onChange={e => onFilter({ ageMin: e.target.value })}/>
          </div>
          <div className="ul-filter-group ul-narrow">
            <label>Age max</label>
            <input type="number" className="ul-filter-input" placeholder="100" min="18" max="100" value={filters.ageMax} onChange={e => onFilter({ ageMax: e.target.value })}/>
          </div>
          <div className="ul-filter-group">
            <label>Department</label>
            <select className="ul-filter-input" value={filters.department} onChange={e => onFilter({ department: e.target.value })}>
              <option value="">All</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="ul-filter-group">
            <label>Role</label>
            <select className="ul-filter-input" value={filters.role} onChange={e => onFilter({ role: e.target.value })}>
              <option value="">All</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="ul-filter-group">
            <label>Status</label>
            <select className="ul-filter-input" value={filters.status} onChange={e => onFilter({ status: e.target.value })}>
              <option value="">All</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {activeCount > 0 && (
          <div className="ul-filter-footer">
            <button className="ul-clear-btn" onClick={clearFilters}>Clear all filters</button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="ul-loading">
          <div className="ul-spinner"/>
          <span>Fetching users...</span>
        </div>
      ) : paged.length === 0 ? (
        <div className="ul-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>No users match your filters</p>
          {activeCount > 0 && <button className="ul-clear-btn" onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="ul-table-wrap">
            <table className="ul-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Name</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((user, i) => (
                  <tr key={user._id}>
                    <td className="ul-row-num">{(safePage - 1) * pageSize + i + 1}</td>
                    <td>
                      <div className="ul-name-cell">
                        <span className="ul-avatar">{user.firstName[0]}{user.lastName[0]}</span>
                        <span className="ul-name-text">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="ul-edit-btn" onClick={() => openEdit(user)} aria-label={`Edit ${user.firstName} ${user.lastName}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="ul-pagination">
            <span className="ul-page-info">
              Showing {(safePage - 1) * pageSize + 1}&ndash;{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="ul-page-buttons">
              <button className="ul-page-btn" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce((acc, n, i, arr) => {
                  if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`dots-${i}`} className="ul-page-dots">...</span>
                  ) : (
                    <button key={item} className={`ul-page-btn ${item === safePage ? 'active' : ''}`} onClick={() => setPage(item)}>{item}</button>
                  )
                )}
              <button className="ul-page-btn" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit popup ── */}
      <EditUserPopup
        isOpen={popupOpen}
        user={popupUser}
        onClose={closeEdit}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
