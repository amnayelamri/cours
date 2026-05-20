const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 3001;
const COURSES_DIR = path.join(__dirname, 'frontend', 'public', 'courses');

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

app.listen(PORT, () => {
  console.log('\n  Dashboard server : http://localhost:' + PORT);
  console.log('  React app        : http://localhost:3000\n');
});
