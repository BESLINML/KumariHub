import { Helmet } from 'react-helmet-async';
import fallbackBusinessImage from '../assets/avif/kanyakumari-featured-local-business.avif';

const SITE_NAME = 'KumariHUB';
const DEFAULT_IMAGE = `https://kumarihub-8592a.web.app/${fallbackBusinessImage.replace(/^\//, '')}`;

const PageSEO = ({ title, description, path, image = DEFAULT_IMAGE, noIndex = false, schema }) => {
  const canonicalUrl = `https://kumarihub-8592a.web.app${path}`;
  const safeDescription = String(description || '').slice(0, 160);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={safeDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex,follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={image || DEFAULT_IMAGE} />
      {schema && <script type="application/ld+json">{JSON.stringify(schema).replace(/</g, '\\u003c')}</script>}
    </Helmet>
  );
};

export default PageSEO;
