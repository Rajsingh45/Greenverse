import React, { createContext, useState } from 'react';
const backendURL= "https://greenverse.onrender.com";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [loggedUser, setLoggedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const currentUserEmail=null

    const handleUserUpdated = (updatedUser) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
        );
    };

    return (
        <UserContext.Provider value={{ loggedUser, setLoggedUser, users, handleUserUpdated,userEmail, setUserEmail ,currentUserEmail}}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
