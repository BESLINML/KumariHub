import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BusinessCard from '../components/BusinessCard';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatOriginalText = (slug) => {
    return slug ? slug.replace(/-/g, ' ') : '';
  };

  const categoryName = formatOriginalText(categorySlug);

  useEffect(() => {
    const fetchCategoryBusinesses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/businesses/category/${encodeURIComponent(categorySlug)}`);
        const data = await res.json();
        console.log(data)
        if (res.ok) {
          setBusinesses(data.businesses || data);
        }
      } catch (error) {
        console.error("Error fetching category businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryBusinesses();
    }
  }, [categoryName, API_URL]);

  const formatSlug = (text) => text ? text.toLowerCase().replace(/\s+/g, '-') : '';

  const handleCardClick = (business) => {
    const categorySlug = formatSlug(business.category);
    const locationSlug = formatSlug(business.location);
    const nameSlug = formatSlug(business.businessName);
    const url = `/${categorySlug}/${locationSlug}/${nameSlug}`;
    window.open(url, '_blank');

  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-serif font-bold capitalize mb-2">{categoryName} Businesses</h1>
      <p className="text-gray-500 mb-8">Showing all active {categoryName} in Kanyakumari</p>

      {loading ? (
        <p>Loading...</p>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businesses.map((item) => (

            <BusinessCard
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
              whatsappNumber={item.whatsappNumber}
              locationLink={item.locationLink}
              onclick={() => handleCardClick(item)}
            />
          ))}

        </div>
      ) : (
        <p className="text-gray-500">No businesses found in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;