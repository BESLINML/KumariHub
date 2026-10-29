import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { business } from "../constant/product.js"

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_api_token') || '');
  const [tokenInput, setTokenInput] = useState('');
  const adminFetch = (url, options = {}) => fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${adminToken}` } });

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
    if (!adminToken) return;
    if (hasFetched.current && !force) return;

    try {
      setLoading(true);
      setLoadPercentage(10);


      const res = await adminFetch(`${API_URL}/api/businesses?all=true&limit=1000`);
      setLoadPercentage(30)
      const data = await res.json();
      setLoadPercentage(40);
      if (res.ok) {
        setBusinesses(data.businesses);
      }
      setLoadPercentage(60);


      const catRes = await fetch(`${API_URL}/api/categories`);
      const catData = await catRes.json();
      if (catRes.ok) {
        setCategory(catData);
        localStorage.setItem('admin_categories', JSON.stringify(catData));
      }
      setLoadPercentage(80);


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
    if (adminToken) fetchAdminData(true);
  }, [adminToken]);


  const refreshAdminData = () => {
    fetchAdminData(true);
  };

  const unlockAdmin = async (event) => {
    event.preventDefault();
    const candidate = tokenInput.trim();
    const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, { headers: { Authorization: `Bearer ${candidate}` } });
    if (!response.ok) return alert('Admin access denied. Check the token and try again.');
    localStorage.setItem('admin_api_token', candidate);
    setAdminToken(candidate);
    setTokenInput('');
  };

  if (!adminToken) return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCF7EF] p-6">
      <form onSubmit={unlockAdmin} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-[#1C1813]">Admin access</h1>
        <label className="mt-4 block text-sm" htmlFor="admin-token">Admin API token</label>
        <input id="admin-token" type="password" autoComplete="current-password" required value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} className="mt-2 w-full rounded-lg border p-3" />
        <button className="mt-4 w-full rounded-lg bg-[#1C1813] p-3 font-semibold text-white">Continue</button>
      </form>
    </main>
  );
  return (
    <AdminContext.Provider value={{
      businesses, setBusinesses,
      category, setCategory,
      locationsList, setLocationsList,
      loading, fetchAdminData, refreshData: refreshAdminData,
      loadPercentage, adminFetch
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);