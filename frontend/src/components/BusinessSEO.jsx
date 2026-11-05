import PageSEO from './PageSEO';

const slug = (value = '') => String(value).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const BusinessSEO = ({ business }) => {
  if (!business) return null;

  const path = `/${slug(business.category)}/${slug(business.location)}/${slug(business.businessName)}`;
  const title = `${business.businessName} | ${business.category} in ${business.location} | KumariHUB`;
  const description = `${business.businessName} is a ${business.category} in ${business.location}, Kanyakumari. View contact details, address, services, opening times and customer reviews on KumariHUB.`;
  const image = /^https?:\/\//i.test(String(business.img || '')) ? business.img : undefined;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://kumarihub-8592a.web.app${path}#business`,
    name: business.businessName,
    description: business.aboutBusness || description,
    image: image ? [image] : undefined,
    url: `https://kumarihub-8592a.web.app${path}`,
    telephone: business.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || undefined,
      addressLocality: business.location || undefined,
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
    ...(business.locationLink ? { hasMap: business.locationLink } : {}),
    ...(Number(business.reviewCount) > 0 && Number(business.avgRating) > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(business.avgRating),
        reviewCount: Number(business.reviewCount),
      },
    } : {}),
  };

  return <PageSEO title={title} description={description} path={path} image={image} noIndex={business.status !== 'active'} schema={schema} />;
};

export default BusinessSEO;
