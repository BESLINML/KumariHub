 const BusinessSEO = ({ business }) => {
  if (!business) return null;

  const currentUrl = window.location.href;
  const createSlug = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.businessName,
    "image": business.img,
    "telephone": business.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": business.location,
      "addressCountry": "IN"
    },
    "url": currentUrl
  };

  return (
    <>
      <title>{`${business.businessName} | ${business.category} in ${business.location} | KumariHUB`}</title>
      <meta name="description" content={`Find ${business.businessName} in ${business.location}. View phone number, WhatsApp, address, timings, photos and reviews on KumariHUB.`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Social Media Preview */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={`${business.businessName} | KumariHUB`} />
      <meta property="og:description" content={`Discover trusted local businesses like ${business.businessName} in ${business.location} on KumariHUB.`} />
      <meta property="og:image" content={business.img} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${business.businessName} | KumariHUB`} />
      <meta name="twitter:image" content={business.img} />

      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </>
  );
};
export default BusinessSEO;