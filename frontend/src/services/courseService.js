const BASE = process.env.PUBLIC_URL || '';
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const getCourses = async () => {
  const res = isLocal
    ? await fetch('/api/courses')
    : await fetch(`${BASE}/courses/index.json`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
};

export const getCourse = async (id) => {
  const res = isLocal
    ? await fetch(`/api/courses/${id}`)
    : await fetch(`${BASE}/courses/${id}/course.json`);
  if (!res.ok) throw new Error('Course not found');
  return res.json();
};

export const createCourse = async (course) => {
  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error('Failed to create course');
  return res.json();
};

export const updateCourse = async (id, course) => {
  const res = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error('Failed to update course');
  return res.json();
};

export const deleteCourse = async (id) => {
  const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete course');
  return res.json();
};

export const uploadAsset = async (courseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`/api/courses/${courseId}/assets`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
};

export const getAssetUrl = (courseId, filePath) =>
  `${BASE}/courses/${courseId}/${filePath}`;
