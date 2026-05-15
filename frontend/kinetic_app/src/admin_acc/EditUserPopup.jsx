
// EditUserPopup.jsx
import React, { useState, useEffect, useRef } from 'react';

const DEPARTMENTS = ['Engineering','Marketing','Sales','HR','Finance','Operations','Design','Support','Legal','Product'];
const ROLES = ['Admin','Manager','Developer','Designer','Analyst','Executive','Intern','Senior Developer','Lead','Coordinator'];
const STATUSES = ['Active','Inactive','Suspended'];

/* Small reusable input component */
function Field({ label, error, children }) {
  return (
    <div className="ep-field">
      <label className="ep-label">{label}</label>
      {children}
      {error && <span className="ep-error">{error}</span>}
    </div>
  );
}

export default function EditUserPopup({ isOpen, user, onClose, onUpdate }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const backdropRef = useRef(null);
  const firstInputRef = useRef(null);

  /* Populate form when user changes */
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        age: user.age ?? '',
        phone: user.phone || '',
        department: user.department || '',
        role: user.role || '',
        status: user.status || '',
      });
      setErrors({});
      setServerError('');
      setSuccess(false);
    }
  }, [user]);

  /* Focus first input on open */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Close on backdrop click */
  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    if (serverError) setServerError('');
  };

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim() || form.firstName.trim().length < 2) errs.firstName = 'Min 2 characters';
    if (!form.lastName.trim() || form.lastName.trim().length < 2) errs.lastName = 'Min 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
    if (form.age === '' || +form.age < 18 || +form.age > 100) errs.age = 'Must be 18-100';
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) errs.phone = 'Invalid phone';
    if (!form.department) errs.department = 'Required';
    if (!form.role) errs.role = 'Required';
    if (!form.status) errs.status = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');
      setSuccess(false);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        age: +form.age,
        phone: form.phone.trim() || undefined,
        department: form.department,
        role: form.role,
        status: form.status,
      };

      await onUpdate(user._id, payload);
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setServerError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="ep-backdrop" ref={backdropRef} onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Edit user">
      <div className="ep-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ep-header">
          <div>
            <h2 className="ep-title">Edit User</h2>
            <p className="ep-subtitle">{user.firstName} {user.lastName}</p>
          </div>
          <button className="ep-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="ep-server-error">{serverError}</div>
        )}

        {/* Success */}
        {success && (
          <div className="ep-server-success">User updated successfully</div>
        )}

        {/* Form */}
        <form className="ep-form" onSubmit={handleSubmit} noValidate>
          <div className="ep-row">
            <Field label="First Name" error={errors.firstName}>
              <input ref={firstInputRef} className="ep-input" value={form.firstName} onChange={set('firstName')} disabled={saving}/>
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <input className="ep-input" value={form.lastName} onChange={set('lastName')} disabled={saving}/>
            </Field>
          </div>

          <Field label="Email" error={errors.email}>
            <input className="ep-input" type="email" value={form.email} onChange={set('email')} disabled={saving}/>
          </Field>

          <div className="ep-row">
            <Field label="Age" error={errors.age}>
              <input className="ep-input" type="number" min="18" max="100" value={form.age} onChange={set('age')} disabled={saving}/>
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className="ep-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1-555-000-0000" disabled={saving}/>
            </Field>
          </div>

          <div className="ep-row">
            <Field label="Department" error={errors.department}>
              <select className="ep-input" value={form.department} onChange={set('department')} disabled={saving}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Role" error={errors.role}>
              <select className="ep-input" value={form.role} onChange={set('role')} disabled={saving}>
                <option value="">Select...</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Status" error={errors.status}>
            <div className="ep-status-group">
              {STATUSES.map(s => (
                <label key={s} className={`ep-status-option ${form.status === s ? 'selected' : ''} ${s.toLowerCase()}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={set('status')} disabled={saving}/>
                  {s}
                </label>
              ))}
            </div>
          </Field>

          {/* Footer buttons */}
          <div className="ep-footer">
            <button type="button" className="ep-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="ep-btn-save" disabled={saving}>
              {saving ? (
                <><span className="ep-btn-spinner"/> Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
