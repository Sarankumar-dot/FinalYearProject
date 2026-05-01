import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const roleColors = { student:'badge-purple', teacher:'badge-green', admin:'badge-amber' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('search', search);
    api.get(`/users?${params}`).then(r=>setUsers(r.data)).catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(load, [search, roleFilter]);

  const changeRole = async (userId, newRole) => {
    await api.put(`/users/${userId}`, { role: newRole }).catch(console.error);
    load();
  };

  const toggleActive = async (userId, current) => {
    await api.put(`/users/${userId}`, { isActive: !current }).catch(console.error);
    load();
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    await api.delete(`/users/${userId}`).catch(console.error);
    load();
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700, marginBottom:'1.5rem' }}>User Management</h1>

      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <input placeholder="Search by name..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:200 }} aria-label="Search users" />
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ width:'auto', minWidth:140 }} aria-label="Filter by role">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <p style={{ color:'var(--color-text-muted)' }}>Loading users...</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {users.map(u => (
            <div key={u._id} className="card" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', padding:'1rem 1.25rem' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#818cf8,#a5b4fc)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', flexShrink:0 }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:150 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{u.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{u.email}</div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
                <span className={`badge ${roleColors[u.role]||'badge-purple'}`} style={{ fontSize:'0.7rem' }}>{u.role}</span>
                {!u.isActive && <span className="badge" style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', fontSize:'0.7rem' }}>Disabled</span>}
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <select value={u.role} onChange={e=>changeRole(u._id, e.target.value)} style={{ width:'auto', fontSize:'0.8rem', padding:'0.3rem 0.5rem' }} aria-label={`Change role for ${u.name}`}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={()=>toggleActive(u._id, u.isActive)} className={`btn ${u.isActive?'btn-secondary':'btn-success'}`} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>
                  {u.isActive ? 'Disable' : 'Enable'}
                </button>
                <button onClick={()=>deleteUser(u._id, u.name)} className="btn btn-danger" style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }} aria-label={`Delete ${u.name}`}>
                  Del
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p style={{ color:'var(--color-text-muted)', textAlign:'center', padding:'2rem' }}>No users found.</p>}
        </div>
      )}
    </div>
  );
}
