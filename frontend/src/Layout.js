import React from 'react';
import Navbar from './Navbar';
const backendURL=process.env.REACT_APP_BACKEND_URL;

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  return (
    <div>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchDisabled={true}/>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
