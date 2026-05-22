const BASE = process.env.PUBLIC_URL || '';
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const bust = () => `?t=${Date.now()}`;

export const getCollections = async () => {
  const res = isLocal
    ? await fetch('/api/collections')
    : await fetch(`${BASE}/collections/index.json${bust()}`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
};

export const createCollection = async (col) => {
  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(col),
  });
  if (!res.ok) throw new Error('Failed to create collection');
  return res.json();
};

export const updateCollection = async (id, col) => {
  const res = await fetch(`/api/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(col),
  });
  if (!res.ok) throw new Error('Failed to update collection');
  return res.json();
};

export const deleteCollection = async (id) => {
  const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete collection');
  return res.json();
};
