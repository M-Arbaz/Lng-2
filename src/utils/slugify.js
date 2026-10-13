export function slugify(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function findCategoryBySlug(categories, slug) {
  if (!categories || !slug) return null;
  return categories.find((c) => slugify(c.id) === slug) || null;
}

export function resolveCategoryName(categories, value) {
  if (!value) return '';
  const normalized = String(value).trim();
  if (!normalized || !Array.isArray(categories) || categories.length === 0) {
    return normalized;
  }

  const match = categories.find((c) => {
    const title = c.title || c.name || '';
    const id = c.id || '';
    const firestoreId = c.firestoreId || '';
    return (
      id === normalized ||
      title === normalized ||
      firestoreId === normalized ||
      slugify(id) === slugify(normalized) ||
      slugify(title) === slugify(normalized) ||
      slugify(firestoreId) === slugify(normalized)
    );
  });

  return match?.title || match?.name || normalized;
}

export default slugify;
