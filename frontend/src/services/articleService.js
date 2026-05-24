const BASE = process.env.PUBLIC_URL || '';
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const bust = () => `?t=${Date.now()}`;

export const getArticles = async () => {
  const res = isLocal
    ? await fetch('/api/articles')
    : await fetch(`${BASE}/articles/index.json${bust()}`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
};

export const getArticle = async (id) => {
  const res = isLocal
    ? await fetch(`/api/articles/${id}`)
    : await fetch(`${BASE}/articles/${id}/article.json${bust()}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
};

export const createArticle = async (article) => {
  const res = await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!res.ok) throw new Error('Failed to create article');
  return res.json();
};

export const updateArticle = async (id, article) => {
  const res = await fetch(`/api/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!res.ok) throw new Error('Failed to update article');
  return res.json();
};

export const deleteArticle = async (id) => {
  const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete article');
  return res.json();
};
