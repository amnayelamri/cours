const BASE = process.env.PUBLIC_URL || '';
const bust = () => `?t=${Date.now()}`;

export const getCollections = async () => {
  const res = await fetch(`${BASE}/collections/index.json${bust()}`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
};
