import fs from 'node:fs';
import path from 'node:path';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const slug = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default async function share(req, res) {
  const { category, location, name } = req.query;
  const apiUrl = process.env.API_URL || process.env.VITE_API_URL;

  try {
    if (!apiUrl || !category || !location || !name) throw new Error('Share metadata is unavailable');

    const endpoint = new URL('/api/businesses/slug', apiUrl);
    endpoint.search = new URLSearchParams({ category, location, name }).toString();
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Business was not found');

    const { business } = await response.json();
    if (!business) throw new Error('Business was not found');

    const canonicalUrl = `https://kumarihub.in/${slug(business.category)}/${slug(business.location)}/${slug(business.businessName)}`;
    const title = `${business.businessName} | KumariHUB`;
    const description = `${business.category} in ${business.location}`;
    const image = business.img || 'https://kumarihub.in/og-cover.jpg';
    const metadata = `
      <title>${escapeHtml(title)}</title>
      <meta name="description" content="${escapeHtml(description)}" />
      <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="KumariHUB" />
      <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
      <meta property="og:title" content="${escapeHtml(title)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      <meta property="og:image" content="${escapeHtml(image)}" />
      <meta property="og:image:alt" content="${escapeHtml(business.businessName)} cover image" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      <meta name="twitter:image" content="${escapeHtml(image)}" />`;

    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8').replace('</head>', `${metadata}\n  </head>`);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch {
    // Keep the route usable if metadata lookup is temporarily unavailable.
    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fs.readFileSync(htmlPath, 'utf8'));
  }
}
