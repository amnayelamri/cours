const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { execSync } = require('child_process');

const app = express();
const PORT = 3002;
const COURSES_DIR      = path.join(__dirname, 'frontend', 'public', 'courses');
const COLLECTIONS_FILE = path.join(__dirname, 'frontend', 'public', 'collections', 'index.json');
const ARTICLES_DIR     = path.join(__dirname, 'frontend', 'public', 'articles');
const ARTICLES_INDEX   = path.join(ARTICLES_DIR, 'index.json');
const BALANCES_FILE    = path.join(__dirname, 'data', 'balances.json');
const PROJECTS_FILE    = path.join(__dirname, 'frontend', 'public', 'projects', 'index.json');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));

if (!fs.existsSync(COURSES_DIR)) fs.mkdirSync(COURSES_DIR, { recursive: true });

const indexPath = path.join(COURSES_DIR, 'index.json');

const readIndex = () => {
  if (!fs.existsSync(indexPath)) fs.writeFileSync(indexPath, '[]');
  return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
};

const writeIndex = (data) => fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));

const toSummary = (course) => ({
  id: course.id,
  title: course.title,
  description: course.description || '',
  tags: course.tags || [],
  createdAt: course.createdAt,
  slideCount: (course.slides || []).length,
});

app.get('/api/courses', (req, res) => res.json(readIndex()));

app.get('/api/courses/:id', (req, res) => {
  const p = path.join(COURSES_DIR, req.params.id, 'course.json');
  if (!fs.existsSync(p)) return res.status(404).json({ message: 'Course not found' });
  res.json(JSON.parse(fs.readFileSync(p, 'utf-8')));
});

app.post('/api/courses', (req, res) => {
  const course = { ...req.body };
  if (!course.id) {
    course.id = (course.title || 'course')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  course.slides = (course.slides || []).map((s, i) => ({ ...s, id: s.id || `slide-${i + 1}` }));
  course.createdAt = course.createdAt || new Date().toISOString().split('T')[0];

  const dir = path.join(COURSES_DIR, course.id);
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(course, null, 2));

  const index = readIndex();
  const idx = index.findIndex(c => c.id === course.id);
  if (idx >= 0) index[idx] = toSummary(course);
  else index.push(toSummary(course));
  writeIndex(index);

  res.status(201).json(course);
});

app.put('/api/courses/:id', (req, res) => {
  const dir = path.join(COURSES_DIR, req.params.id);
  if (!fs.existsSync(dir)) return res.status(404).json({ message: 'Course not found' });

  const course = req.body;
  fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(course, null, 2));

  const index = readIndex();
  const idx = index.findIndex(c => c.id === req.params.id);
  if (idx >= 0) { index[idx] = toSummary(course); writeIndex(index); }

  res.json(course);
});

app.delete('/api/courses/:id', (req, res) => {
  const dir = path.join(COURSES_DIR, req.params.id);
  if (!fs.existsSync(dir)) return res.status(404).json({ message: 'Course not found' });
  fs.rmSync(dir, { recursive: true, force: true });
  writeIndex(readIndex().filter(c => c.id !== req.params.id));
  res.json({ message: 'Course deleted' });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(COURSES_DIR, req.params.id, 'assets');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

app.post('/api/courses/:id/assets', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.originalname, path: `assets/${req.file.originalname}` });
});

// ── Collections ──────────────────────────────────────────────────────────────

const readCollections = () => {
  if (!fs.existsSync(COLLECTIONS_FILE)) {
    fs.mkdirSync(path.dirname(COLLECTIONS_FILE), { recursive: true });
    fs.writeFileSync(COLLECTIONS_FILE, '[]');
  }
  return JSON.parse(fs.readFileSync(COLLECTIONS_FILE, 'utf-8'));
};
const writeCollections = (data) =>
  fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(data, null, 2));

app.get('/api/collections', (req, res) => res.json(readCollections()));

app.post('/api/collections', (req, res) => {
  const col = { ...req.body };
  if (!col.id) {
    col.id = (col.title || 'dossier')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  col.courseIds = col.courseIds || [];
  const list = readCollections();
  const idx = list.findIndex(c => c.id === col.id);
  if (idx >= 0) list[idx] = col; else list.push(col);
  writeCollections(list);
  res.status(201).json(col);
});

app.put('/api/collections/:id', (req, res) => {
  const list = readCollections();
  const idx = list.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Collection not found' });
  list[idx] = { ...req.body, id: req.params.id };
  writeCollections(list);
  res.json(list[idx]);
});

app.delete('/api/collections/:id', (req, res) => {
  writeCollections(readCollections().filter(c => c.id !== req.params.id));
  res.json({ message: 'Deleted' });
});

// ── Articles ──────────────────────────────────────────────────────────────────

const readArticleIndex = () => {
  if (!fs.existsSync(ARTICLES_INDEX)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    fs.writeFileSync(ARTICLES_INDEX, '[]');
  }
  return JSON.parse(fs.readFileSync(ARTICLES_INDEX, 'utf-8'));
};
const writeArticleIndex = (data) =>
  fs.writeFileSync(ARTICLES_INDEX, JSON.stringify(data, null, 2));

const toArticleSummary = (a) => ({
  id:         a.id,
  title:      a.title,
  excerpt:    a.excerpt    || '',
  tags:       a.tags       || [],
  date:       a.date,
  coverEmoji: a.coverEmoji || '📝',
  readTime:   a.readTime   || null,
});

app.get('/api/articles', (req, res) => res.json(readArticleIndex()));

app.get('/api/articles/:id', (req, res) => {
  const p = path.join(ARTICLES_DIR, req.params.id, 'article.json');
  if (!fs.existsSync(p)) return res.status(404).json({ message: 'Article not found' });
  res.json(JSON.parse(fs.readFileSync(p, 'utf-8')));
});

app.post('/api/articles', (req, res) => {
  const article = { ...req.body };
  if (!article.id) {
    article.id = (article.title || 'article')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  article.date = article.date || new Date().toISOString().split('T')[0];

  const dir = path.join(ARTICLES_DIR, article.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'article.json'), JSON.stringify(article, null, 2));

  const index = readArticleIndex();
  const idx = index.findIndex(a => a.id === article.id);
  if (idx >= 0) index[idx] = toArticleSummary(article);
  else index.unshift(toArticleSummary(article)); // plus récent en premier
  writeArticleIndex(index);

  res.status(201).json(article);
});

app.put('/api/articles/:id', (req, res) => {
  const dir = path.join(ARTICLES_DIR, req.params.id);
  if (!fs.existsSync(dir)) return res.status(404).json({ message: 'Article not found' });

  const article = { ...req.body, id: req.params.id };
  fs.writeFileSync(path.join(dir, 'article.json'), JSON.stringify(article, null, 2));

  const index = readArticleIndex();
  const idx = index.findIndex(a => a.id === req.params.id);
  if (idx >= 0) { index[idx] = toArticleSummary(article); writeArticleIndex(index); }

  res.json(article);
});

app.delete('/api/articles/:id', (req, res) => {
  const dir = path.join(ARTICLES_DIR, req.params.id);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  writeArticleIndex(readArticleIndex().filter(a => a.id !== req.params.id));
  res.json({ message: 'Deleted' });
});

// ── Balances (local uniquement — stockées dans data/, hors de public/) ────────

const readBalances = () => {
  if (!fs.existsSync(BALANCES_FILE)) {
    fs.mkdirSync(path.dirname(BALANCES_FILE), { recursive: true });
    fs.writeFileSync(BALANCES_FILE, '[]');
  }
  return JSON.parse(fs.readFileSync(BALANCES_FILE, 'utf-8'));
};
const writeBalances = (data) =>
  fs.writeFileSync(BALANCES_FILE, JSON.stringify(data, null, 2));

app.get('/api/balances', (req, res) => res.json(readBalances()));

app.post('/api/balances', (req, res) => {
  const balance = { ...req.body };
  if (!balance.id) balance.id = 'balance-' + Date.now();
  balance.createdAt = balance.createdAt || new Date().toISOString().split('T')[0];
  balance.items = (balance.items || []).map((item, i) => ({
    id:    item.id    || `item-${Date.now()}-${i}`,
    label: item.label || '',
    value: item.value || '',
  }));
  const list = readBalances();
  list.unshift(balance);
  writeBalances(list);
  res.status(201).json(balance);
});

app.put('/api/balances/:id', (req, res) => {
  const list = readBalances();
  const idx  = list.findIndex(b => b.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Balance not found' });
  list[idx] = { ...req.body, id: req.params.id };
  writeBalances(list);
  res.json(list[idx]);
});

app.delete('/api/balances/:id', (req, res) => {
  writeBalances(readBalances().filter(b => b.id !== req.params.id));
  res.json({ message: 'Deleted' });
});

// ── Projets ───────────────────────────────────────────────────────────────────

const readProjects  = () => {
  if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, '[]');
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
};
const writeProjects = (data) => fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2));

app.get('/api/projects', (req, res) => res.json(readProjects()));

app.post('/api/projects', (req, res) => {
  const project = {
    ...req.body,
    id: req.body.id || 'project-' + Date.now(),
    createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
  };
  const list = readProjects();
  list.unshift(project);
  writeProjects(list);
  res.status(201).json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const list = readProjects();
  const idx  = list.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Project not found' });
  list[idx] = { ...list[idx], ...req.body, id: req.params.id };
  writeProjects(list);
  res.json(list[idx]);
});

app.delete('/api/projects/:id', (req, res) => {
  writeProjects(readProjects().filter(p => p.id !== req.params.id));
  res.json({ message: 'Deleted' });
});

// ── Déploiement GitHub Pages ──────────────────────────────────────────────────

app.post('/api/deploy', (req, res) => {
  const ROOT = __dirname;
  const steps = [];
  try {
    steps.push(execSync('git add frontend/public/', { cwd: ROOT }).toString());
    // Vérifie s'il y a quelque chose à committer
    const status = execSync('git status --porcelain frontend/public/', { cwd: ROOT }).toString().trim();
    if (!status) {
      return res.json({ success: true, message: 'Aucun changement à publier.' });
    }
    const date = new Date().toLocaleString('fr-FR');
    steps.push(execSync(
      `git commit -m "dashboard: mise à jour du contenu (${date})"`,
      { cwd: ROOT }
    ).toString());
    steps.push(execSync('git push origin main', { cwd: ROOT }).toString());
    res.json({ success: true, message: 'Publié sur GitHub Pages ✅ (mise à jour dans ~2 min)' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('\n  Dashboard server : http://localhost:' + PORT);
  console.log('  React app        : http://localhost:3000\n');
});
