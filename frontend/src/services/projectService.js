const BASE = process.env.PUBLIC_URL || '';
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const bust = () => `?t=${Date.now()}`;

export const getProjects = async () => {
  const res = isLocal
    ? await fetch('/api/projects')
    : await fetch(`${BASE}/projects/index.json${bust()}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

export const createProject = async (data) => {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
};

export const updateProject = async (id, data) => {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
};

export const deleteProject = async (id) => {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
};
