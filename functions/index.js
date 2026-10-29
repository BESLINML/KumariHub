const { onRequest } = require('firebase-functions/v2/https');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

exports.shareMetadata = onRequest({ region: 'asia-south1' }, async (req, res) => {
  const host = req.get('host');
  const origin = `https://${host}`;
  let html;

  try {
    const shellResponse = await fetch(`${origin}/index.html`);
    if (!shellResponse.ok) throw new Error('Frontend shell unavailable');
    html = await shellResponse.text();
  } catch (error) {
    console.error('Could not load the app shell for share route:', error);
    return res.status(502).send('KumariHUB is temporarily unavailable.');
  }

  try {
    const parts = req.path.split('/').filter(Boolean);
    if (parts.length === 3 && process.env.API_URL) {
      const endpoint = new URL('/api/businesses/slug', process.env.API_URL);
      endpoint.search = new URLSearchParams({ category: parts[0], location: parts[1], name: parts[2] }).toString();
      const businessResponse = await fetch(endpoint);
      if (businessResponse.ok) {
        const { business } = await businessResponse.json();
        if (business) {
          const title = `${business.businessName} | KumariHUB`;
          const description = `${business.category} in ${business.location}`;
          const image = business.img || `${origin}/og-cover.jpg`;
          const canonical = `${origin}${req.path}`;
          const metadata = `
      <title>${escapeHtml(title)}</title>
      <meta name="description" content="${escapeHtml(description)}" />
      <link rel="canonical" href="${escapeHtml(canonical)}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="KumariHUB" />
      <meta property="og:url" content="${escapeHtml(canonical)}" />
      <meta property="og:title" content="${escapeHtml(title)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      <meta property="og:image" content="${escapeHtml(image)}" />
      <meta property="og:image:alt" content="${escapeHtml(business.businessName)} cover image" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      <meta name="twitter:image" content="${escapeHtml(image)}" />`;
          html = html.replace('</head>', `${metadata}\n  </head>`);
        }
      }
    }
  } catch (error) {
    console.error('Share metadata error:', error);
  }

  res.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.type('html').status(200).send(html);
});
