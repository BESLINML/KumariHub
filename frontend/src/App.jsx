import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './components/Layout'
import AdminBusinessProfile from './components/AdminBusinessProfile'
import { AdminProvider } from './context/AdminContext'
import UserBusinessProfile from './components/UserBusinessProfile'
import AdminLayout from "./pages/admin/AdminLayout"
import Dashboard from './pages/admin/Dashboard'
import InactiveList from './pages/admin/InactiveList'
import PendingSubmissions from './pages/admin/PendingSubmissions'
import RecentBusinesses from './pages/admin/RecentBusinesses'
import PremiumList from './pages/admin/PremiumList'
import Renewal from './pages/admin/Renewal'
import Other from './pages/admin/Other'
import CategoryPage from './pages/CategoryPage'
import CategoryLocationPage from './pages/CategoryLocationPage'

const App = () => {
  return (
    <div className="bg-[#FCF7EF]">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/:categorySlug" element={<CategoryPage />} />
            <Route path="/:categorySlug/:locationSlug" element={<CategoryLocationPage />} />
            <Route path="/:category/:location/:businessName" element={<UserBusinessProfile />} />

          </Route>

          <Route path="/admin-dashBoard" element={
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          }>
            <Route index element={<Dashboard />} />
            <Route path="/admin-dashBoard/inactive-list" element={<InactiveList />} />
            <Route path="/admin-dashBoard/pending-submission" element={<PendingSubmissions />} />
            <Route path="/admin-dashBoard/recent-businesses" element={<RecentBusinesses />} />
            <Route path="/admin-dashBoard/premium-list" element={<PremiumList />} />
            <Route path="/admin-dashBoard/renewal-list" element={<Renewal />} />
            <Route path="/admin-dashBoard/other" element={<Other />} />

          </Route>


          <Route path="/admin-dashBoard/business/:id" element={
            <AdminProvider>
              <AdminBusinessProfile />
            </AdminProvider>
          } />

        </Routes>
      </BrowserRouter>
    </div>

  )
}

export default App