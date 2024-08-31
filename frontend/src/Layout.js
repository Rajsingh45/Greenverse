import React from 'react';
import Navbar from './Navbar';
const backendURL="https://greenverse-fp31.onrender.com";

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  return (
    <div>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchDisabled={true}/>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
