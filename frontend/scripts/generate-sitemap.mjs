import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(scriptDirectory, '..');
const siteOrigin = 'https://kumarihub-8592a.web.app';

function readApiUrl() {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL.replace(/\/$/, '');
  for (const filename of ['.env.production', '.env']) {
    try {
      const contents = readFileSync(resolve(frontendDirectory, filename), 'utf8');
      const line = contents.split(/\r?\n/).find((entry) => /^\s*VITE_API_URL\s*=/.test(entry));
      if (line) return line.replace(/^\s*VITE_API_URL\s*=\s*/, '').replace(/^['"]|['"]$/g, '').replace(/\/$/, '');
    } catch {
      // Continue to the next supported env file.
    }
  }
  return '';
}

const slug = (value = '') => String(value).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
}[character]));
const entries = new Map([[`${siteOrigin}/`, {}]]);
const apiUrl = readApiUrl();

if (apiUrl) {
  try {
    const endpoint = `${apiUrl}/api/businesses`;
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages && page <= 500) {
      const response = await fetch(`${endpoint}?limit=100&page=${page}`, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Business API returned HTTP ${response.status}`);
      const result = await response.json();
      const businesses = Array.isArray(result) ? result : result.businesses || [];
      totalPages = Math.max(1, Math.min(Number(result.totalPages) || 1, 500));
      for (const business of businesses) {
        if (business.status && business.status !== 'active') continue;
        const category = slug(business.category);
        const location = slug(business.location);
        const name = slug(business.businessName);
        if (!category || !location || !name) continue;
        const profilePath = `/${category}/${location}/${name}`;
        entries.set(`${siteOrigin}/${category}`, {});
        entries.set(`${siteOrigin}/${category}/${location}`, {});
        entries.set(`${siteOrigin}/location/${location}`, {});
        entries.set(`${siteOrigin}${profilePath}`, { lastmod: business.updatedAt || business.createdAt });
      }
      page += 1;
    }
  } catch (error) {
    console.warn(`Sitemap generated without live business URLs: ${error.message}`);
  }
} else {
  console.warn('VITE_API_URL is missing; sitemap contains the homepage only.');
}

const urlEntries = [...entries.entries()].map(([url, metadata]) => {
  const lastmod = metadata.lastmod && !Number.isNaN(new Date(metadata.lastmod).getTime())
    ? `<lastmod>${new Date(metadata.lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
  return `<url><loc>${escapeXml(url)}</loc>${lastmod}</url>`;
}).join('');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}</urlset>\n`;
const outputPath = resolve(frontendDirectory, 'dist', 'sitemap.xml');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, xml);
console.log(`Generated sitemap with ${entries.size} URLs.`);
