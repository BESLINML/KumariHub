export const seoSlug = (value = '') => String(value).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const titleCaseSlug = (value = '') => String(value).replace(/[-_]+/g, ' ').trim()
  .replace(/\b\w/g, (character) => character.toUpperCase());
