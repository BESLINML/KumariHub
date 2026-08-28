import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BusinessCard from '../components/BusinessCard';

const CategoryLocationPage = () => {
  const { categorySlug, locationSlug } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatOriginalText = (slug) => slug ? slug.replace(/-/g, ' ').trim() : '';

  const categoryName = formatOriginalText(categorySlug);
  const locationName = formatOriginalText(locationSlug);

  useEffect(() => {
    const fetchFilteredBusinesses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/businesses/${encodeURIComponent(categorySlug)}/${encodeURIComponent(locationSlug)}`);
        const data = await res.json();

        if (res.ok) {
          setBusinesses(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && locationSlug) {
      fetchFilteredBusinesses();
    }
  }, [categorySlug, locationSlug, API_URL]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-serif font-bold capitalize mb-2">
        {categoryName} in {locationName}
      </h1>
      <p className="text-gray-500 mb-8">Showing all active {categoryName} in {locationName}</p>

      {loading ? (
        <p>Loading...</p>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businesses.map((item) => (
            <BusinessCard key={item._id} {...item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No {categoryName} found in {locationName}.</p>
      )}
    </div>
  );
};

export default CategoryLocationPage;