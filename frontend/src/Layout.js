import React from 'react';
import Navbar from './Navbar';
const backendURL="https://greenverse-d0ch.onrender.com";

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  return (
    <div>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchDisabled={true}/>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
