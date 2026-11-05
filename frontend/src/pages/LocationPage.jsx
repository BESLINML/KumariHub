import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BusinessCard from '../components/BusinessCard';
import PageSEO from '../components/PageSEO';
import { seoSlug, titleCaseSlug } from '../utils/seo';

const LocationPage = () => {
  const { locationSlug } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const locationName = titleCaseSlug(locationSlug);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/businesses/location/${encodeURIComponent(locationSlug)}`);
        const data = await response.json();
        if (response.ok) setBusinesses(Array.isArray(data) ? data : data.businesses || []);
      } catch (error) {
        console.error('Could not load businesses for location:', error);
      } finally {
        setLoading(false);
      }
    };
    if (locationSlug) loadBusinesses();
  }, [API_URL, locationSlug]);

  const canonicalPath = `/location/${seoSlug(locationSlug)}`;
  return (
    <main className="mx-auto max-w-7xl p-6">
      <PageSEO
        title={`Businesses in ${locationName}, Kanyakumari | KumariHUB`}
        description={`Find trusted local businesses in ${locationName}, Kanyakumari. Browse shops, services, restaurants and more with contact details and reviews on KumariHUB.`}
        path={canonicalPath}
        schema={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Businesses in ${locationName}`, url: `https://kumarihub-8592a.web.app${canonicalPath}` }}
      />
      <h1 className="mb-2 text-3xl font-bold capitalize">Businesses in {locationName}</h1>
      <p className="mb-8 text-gray-500">Local businesses serving {locationName}, Kanyakumari district.</p>
      {loading ? <p>Loading businesses...</p> : businesses.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {businesses.map((item) => <BusinessCard
            key={item._id}
            img={item.img}
            categories={item.category}
            bussinessName={item.businessName}
            location={item.location}
            address={item.address}
            openTime={item.timing}
            avgReview={item.avgRating}
            reviewCount={item.reviewCount}
            phone={item.phone}
            whatsappNumber={item.whatsapp}
            locationLink={item.locationLink}
            onclick={() => navigate(`/${seoSlug(item.category)}/${seoSlug(item.location)}/${seoSlug(item.businessName)}`)}
          />)}
        </div>
      ) : <p className="text-gray-500">No businesses found in {locationName}.</p>}
    </main>
  );
};

export default LocationPage;
