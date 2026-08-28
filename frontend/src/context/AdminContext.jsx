import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { business } from "../constant/product.js"

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [locationsList, setLocationsList] = useState(() => {
    const saved = localStorage.getItem('admin_locations');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState(0);

  const hasFetched = useRef(false);

  const fetchAdminData = async (force = false) => {
    if (hasFetched.current && !force) return;

    try {
      setLoading(true);
      setLoadPercentage(10);


      const res = await fetch(`${API_URL}/api/businesses?all=true&limit=1000`);
      setLoadPercentage(30)
      const data = await res.json();
      setLoadPercentage(40);
      if (res.ok) {
        setBusinesses(data.businesses);
      }
      setLoadPercentage(60);

      // 2. Fetch Categories
      const catRes = await fetch(`${API_URL}/api/categories`);
      const catData = await catRes.json();
      if (catRes.ok) {
        setCategory(catData);
        localStorage.setItem('admin_categories', JSON.stringify(catData));
      }
      setLoadPercentage(80);

      // 3. Fetch Locations
      const locRes = await fetch(`${API_URL}/api/locations`);
      const locData = await locRes.json();
      if (locRes.ok) {
        setLocationsList(locData);
        localStorage.setItem('admin_locations', JSON.stringify(locData));
      }
      setLoadPercentage(100);

      hasFetched.current = true;
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);


  const refreshAdminData = () => {
    fetchAdminData(true);
  };

  return (
    <AdminContext.Provider value={{
      businesses, setBusinesses,
      category, setCategory,
      locationsList, setLocationsList,
      loading, fetchAdminData, refreshData: refreshAdminData,
      loadPercentage
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);