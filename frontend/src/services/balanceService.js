// Balances — local uniquement (pas de version GitHub Pages)
const API = 'http://localhost:3002';

export const getBalances   = ()        => fetch(`${API}/api/balances`).then(r => r.json());
export const createBalance = (data)    => fetch(`${API}/api/balances`,       { method: 'POST',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const updateBalance = (id, data) => fetch(`${API}/api/balances/${id}`, { method: 'PUT',    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteBalance = (id)      => fetch(`${API}/api/balances/${id}`, { method: 'DELETE' }).then(r => r.json());
