import React from 'react'
import NavBar from './NavBar'
import Footer from "./Footer.jsx"
import { Outlet } from 'react-router-dom'

const Layout = ({ children, searchTerm, setSearchTerm }) => {
  return (
    <>
      <NavBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout