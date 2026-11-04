import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { business } from "../constant/product.js"
import { adminFetch, setAdminToken } from '../utils/adminFetch';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const [adminToken, setAdminTokenState] = useState(() => {
    localStorage.removeItem('admin_api_token');
    return '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [locationsList, setLocationsList] = useState(() => {
    const saved = localStorage.getItem('admin_locations');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [loadPercentage, setLoadPercentage] = useState(0);

  const hasFetched = useRef(false);

  const fetchAdminData = async (force = false) => {
    if (!adminToken) return;
    if (hasFetched.current && !force) return;

    try {
      setLoading(true);
      setAdminError('');
      setLoadPercentage(10);


      const res = await adminFetch(`${API_URL}/api/businesses?all=true&limit=1000`);
      setLoadPercentage(30)
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAdminToken('');
          setAdminTokenState('');
        }
        throw new Error(data.error || 'Could not load admin business data.');
      }
      setLoadPercentage(40);
      setBusinesses(Array.isArray(data.businesses) ? data.businesses : []);
      setLoadPercentage(60);


      const catRes = await fetch(`${API_URL}/api/categories`);
      const catData = await catRes.json();
      if (!catRes.ok) throw new Error(catData.error || 'Could not load business categories.');
      setCategory(catData);
      localStorage.setItem('admin_categories', JSON.stringify(catData));
      setLoadPercentage(80);


      const locRes = await fetch(`${API_URL}/api/locations`);
      const locData = await locRes.json();
      if (!locRes.ok) throw new Error(locData.error || 'Could not load business locations.');
      setLocationsList(locData);
      localStorage.setItem('admin_locations', JSON.stringify(locData));
      setLoadPercentage(100);

      hasFetched.current = true;
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setAdminError(error.message || 'Could not load the admin dashboard.');
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
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.error || 'Admin login failed.');
        return;
      }
      setAdminToken(data.token);
      setAdminTokenState(data.token);
      setPasswordInput('');
    } catch {
      setLoginError('Could not connect to the server. Please try again.');
    }
  };

  if (!adminToken) return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCF7EF] p-6">
      <form onSubmit={unlockAdmin} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-[#1C1813]">Admin access</h1>
        <label className="mt-4 block text-sm" htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} className="mt-2 w-full rounded-lg border p-3" />
        {loginError && <p role="alert" className="mt-3 text-sm text-red-600">{loginError}</p>}
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
      loadPercentage, adminFetch, adminError
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
